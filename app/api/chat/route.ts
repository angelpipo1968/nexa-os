import { Anthropic } from '@anthropic-ai/sdk';
import { type NextRequest } from 'next/server';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  system?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  attachments?: Array<{ media_type: string; data: string }>;
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Solicitud inválida: JSON malformado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const {
    messages,
    system,
    model = 'claude-3-haiku-20240307',
    max_tokens = 1000,
    temperature = 0.7,
    attachments = []
  } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Se requiere al menos un mensaje' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: ANTHROPIC_API_KEY no configurada en .env.local');
    return new Response(JSON.stringify({
      error: 'Error de configuración: Falta la clave de Anthropic. Verifica .env.local.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const anthropicMessages = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
  }));

  let finalMessages: any[] = [...anthropicMessages];

  // Handle attachments for the last user message
  if (attachments.length > 0) {
    const lastMsgIndex = finalMessages.length - 1;
    const lastMsg = finalMessages[lastMsgIndex];

    if (lastMsg && lastMsg.role === 'user') {
      const imageBlocks = attachments.map(att => ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: att.media_type as any,
          data: att.data
        }
      }));

      finalMessages[lastMsgIndex] = {
        role: 'user',
        content: [
          { type: 'text', text: lastMsg.content },
          ...imageBlocks
        ]
      };
    }
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      temperature,
      ...(system ? { system } : {}),
      messages: finalMessages as any
    });

    // Extract text content safely
    const textContent = response.content.find(c => c.type === 'text');
    const content = textContent && 'text' in textContent ? textContent.text : '';

    return new Response(JSON.stringify({
      content: content
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error: any) {
    console.error('❌ Error en /api/chat:', error);

    if (error?.status === 401) {
      return new Response(JSON.stringify({
        error: 'Clave de Anthropic inválida o expirada. Verifica .env.local.'
      }), { status: 401 });
    }

    if (error?.status === 429) {
      return new Response(JSON.stringify({
        error: 'Límite de tasa excedido. Espera unos segundos e inténtalo de nuevo.'
      }), { status: 429 });
    }

    return new Response(JSON.stringify({
      error: 'Error interno del servidor: ' + (error.message || 'Desconocido')
    }), { status: 500 });
  }
}

export const runtime = 'edge';
