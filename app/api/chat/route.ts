import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { type NextRequest } from 'next/server';
import OpenAI from 'openai';

// Tipos para validación
interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string | Array<any> }>;
  system?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  attachments?: Array<{ media_type: string; data: string }>;
}

export async function POST(req: NextRequest) {
  // ✅ Validar método y cuerpo
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
    model: initialModel = 'claude-3-haiku-20240307',
    max_tokens = 1000,
    temperature = 0.7,
    attachments = []
  } = body;

  let model = initialModel;

  // ✅ Validar mensajes
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Se requiere al menos un mensaje' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // ----------------------------------------------------------------------
  // 🚀 ESTRATEGIA: Selector Inteligente de Proveedor (Gemini / Anthropic / OpenAI)
  // ----------------------------------------------------------------------

  // 1. Recuperar API Key de headers o env
  const apiKeyHeader = req.headers.get('x-anthropic-key');
  let providedKey = apiKeyHeader && apiKeyHeader !== 'undefined' ? apiKeyHeader : null;

  // Detectar tipo de llave
  const isGeminiKey = providedKey?.startsWith('AIza');
  const googleKey = isGeminiKey ? providedKey : process.env.GOOGLE_API_KEY;

  console.log('🔑 Key Provista:', providedKey ? 'Sí (Oculta)' : 'No');
  console.log('🤖 Detección Gemini:', !!googleKey);

  // Si no hay key de Google pero se pidió un modelo Gemini, cambiar a Claude (Fallback)
  if (!googleKey && model.includes('gemini')) {
    console.log('⚠️ No Google Key encontrada, cambiando a Anthropic Claude...');
    model = 'claude-3-haiku-20240307';
  }

  // Si tenemos clave de Google, intentamos usar Gemini
  if (googleKey) {
    try {
      console.log('⚡ Usando Google Gemini (Fast/Free Tier)...');
      const genAI = new GoogleGenerativeAI(googleKey);

      // Usar gemini-1.5-flash por defecto por ser rápido y económico
      const geminiModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: system // Gemini 1.5 soporta instrucciones de sistema
      });

      // Convertir historial de mensajes al formato de Gemini
      // Anthropic: role='assistant' -> Gemini: role='model'
      const history = messages.slice(0, -1).map(msg => {
        const parts = [];
        if (Array.isArray(msg.content)) {
          msg.content.forEach(c => {
            if (c.type === 'text') parts.push({ text: c.text });
            if (c.type === 'image') {
              parts.push({
                inlineData: {
                  mimeType: c.source?.media_type || 'image/jpeg',
                  data: c.source?.data
                }
              });
            }
          });
        } else {
          parts.push({ text: msg.content });
        }
        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts
        };
      });

      // Preparar el último mensaje (el que se envía ahora)
      const lastMsg = messages[messages.length - 1];
      const lastMsgParts = [];

      if (Array.isArray(lastMsg.content)) {
        lastMsg.content.forEach(c => {
          if (c.type === 'text') lastMsgParts.push({ text: c.text });
        });
      } else {
        lastMsgParts.push({ text: lastMsg.content });
      }

      // Añadir adjuntos (attachments) al último mensaje si existen
      if (attachments && attachments.length > 0) {
        attachments.forEach(att => {
          lastMsgParts.push({
            inlineData: {
              mimeType: att.media_type,
              data: att.data
            }
          });
        });
      }

      // Iniciar chat
      const chat = geminiModel.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: max_tokens,
          temperature: temperature,
        },
      });

      // Enviar mensaje
      const result = await chat.sendMessage(lastMsgParts);
      const response = await result.response;
      const text = response.text();

      // Retornar en formato compatible con el frontend (estilo Anthropic)
      return new Response(JSON.stringify({
        id: 'gemini-' + Date.now(),
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: text }],
        model: 'gemini-1.5-flash',
        stop_reason: 'end_turn',
        usage: { input_tokens: 0, output_tokens: 0 }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('⚠️ Error con Gemini, intentando fallback a Anthropic:', error);
      // Si falla Gemini, cambiamos el modelo a uno válido para Anthropic (Haiku es más seguro/rápido)
      if (model.includes('gemini')) {
        model = 'claude-3-haiku-20240307';
        console.log('🔄 Cambiando modelo a Anthropic (fallback):', model);
      }
    }
  }

  // ... (imports existentes se mantienen arriba, pero aquí reescribimos el manejo del chat)

  // ... (imports existentes se mantienen arriba, pero aquí reescribimos el manejo del chat)

  // ----------------------------------------------------------------------
  // 🐢 LOGIC: Selector de Proveedor (Anthropic vs OpenAI) - Si falla Gemini o no se usó
  // ----------------------------------------------------------------------

  // Si ya usamos Gemini arriba y tuvimos éxito, no llegaremos aquí (porque hace return).
  // Si llegamos aquí, es porque no era Gemini o falló.

  const apiKey = providedKey || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_NEXA_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: Ni GOOGLE_API_KEY, ANTHROPIC_API_KEY ni OPENAI_API_KEY configuradas.');
    return new Response(JSON.stringify({
      error: 'Error de configuración: No se encontró ninguna API Key válida.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Determinar proveedor basado en formato de Key
  const isAnthropicKey = apiKey.startsWith('sk-ant-');
  const isOpenAIKey = apiKey.startsWith('sk-'); // OpenAI keys usually start with sk-

  if (isOpenAIKey && !isAnthropicKey) {
    // --- OPENAI LOGIC ---
    console.log('🤖 Usando OpenAI (Key detectada)...');
    try {
      const openai = new OpenAI({ apiKey });

      // Convertir mensajes a formato OpenAI
      const openAIMessages: any[] = messages.map(msg => {
        if (Array.isArray(msg.content)) {
          // Manejo simplificado de contenido multimodal por ahora para OpenAI
          const contentParts = msg.content.map(c => {
            if (c.type === 'image') {
              return { type: 'image_url', image_url: { url: `data:${c.source.media_type};base64,${c.source.data}` } };
            }
            return { type: 'text', text: c.text };
          });
          return { role: msg.role, content: contentParts };
        }
        return { role: msg.role, content: msg.content };
      });

      // Insertar system prompt si existe
      if (system) {
        openAIMessages.unshift({ role: 'system', content: system });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Modelo rápido y capaz por defecto
        messages: openAIMessages as any,
        max_tokens: max_tokens,
        temperature: temperature,
      });

      const reply = completion.choices[0]?.message?.content || "";

      // Retornar en formato compatible con Anthropic (Messages API)
      return new Response(JSON.stringify({
        id: completion.id,
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: reply }],
        model: completion.model,
        stop_reason: completion.choices[0]?.finish_reason,
        usage: completion.usage
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error: any) {
      console.error('❌ Error en API Chat (OpenAI):', error);
      // Fallback a Simulación
      return new Response(JSON.stringify({
        id: 'sim-openai-' + Date.now(),
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: "⚠️ **Modo de Respaldo (OpenAI Falló)**\n\nNo puedo conectar con mis servidores de IA (posible error de cuota o red). Estoy operando en modo limitado de emergencia." }],
        model: 'nexa-simulation-1.0',
        stop_reason: 'end_turn',
        usage: { input_tokens: 0, output_tokens: 0 }
      }), { headers: { 'Content-Type': 'application/json' } });
    }
  }

  // --- ANTHROPIC LOGIC (Default fallback) ---
  console.log('🤖 Usando Anthropic Claude...');

  // ✅ Preparar mensajes para Anthropic
  const anthropicMessages = messages.map(msg => ({
    role: msg.role,
    content: Array.isArray(msg.content)
      ? msg.content
      : [{ type: 'text' as const, text: msg.content as string }]
  }));

  // ✅ Si hay attachments (imágenes), fusionarlas con el último mensaje
  let finalMessages = [...anthropicMessages];
  if (attachments.length > 0) {
    const lastMsg = finalMessages[finalMessages.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      const imageBlocks = attachments.map(att => ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: att.media_type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: att.data
        }
      }));
      finalMessages[finalMessages.length - 1] = {
        ...lastMsg,
        content: Array.isArray(lastMsg.content)
          ? [...lastMsg.content, ...imageBlocks]
          : [{ type: 'text' as const, text: String(lastMsg.content) }, ...imageBlocks]
      };
    }
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      temperature,
      system,
      messages: finalMessages as any, // Casting necesario por diferencias de tipos estrictos
    });

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error en API Chat:', error);

    // Fallback Final: Simulación
    return new Response(JSON.stringify({
      id: 'sim-anthropic-' + Date.now(),
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: "⚠️ **Modo de Respaldo Activado**\n\nMis sistemas de IA principales (Gemini/Claude) no están disponibles. \n\nEsto suele deberse a:\n1. Claves de API agotadas o inválidas.\n2. Errores de conexión con los servidores de IA.\n\nEl sistema operativo sigue funcional, pero mi capacidad de conversación es limitada." }],
      model: 'nexa-simulation-1.0',
      stop_reason: 'end_turn',
      usage: { input_tokens: 0, output_tokens: 0 }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
