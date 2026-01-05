
export interface AIMessage { 
  role: 'user' | 'assistant' | 'system'; 
  content: string; 
} 
 
export class AIService { 
  private apiKey: string; 
  private baseUrl = 'https://api.hunyuan.qq.com/v1/chat/completions'; 
 
  constructor(apiKey: string) { 
    this.apiKey = apiKey; 
  } 
 
  async generateResponse( 
    messages: AIMessage[],  
    options: { temperature?: number; maxTokens?: number } = {} 
  ): Promise<string> { 
    try { 
      const response = await fetch(this.baseUrl, { 
        method: 'POST', 
        headers: { 
          'Authorization': `Bearer ${this.apiKey}`, 
          'Content-Type': 'application/json', 
        }, 
        body: JSON.stringify({ 
          model: 'hunyuan-lite', 
          messages, 
          temperature: options.temperature || 0.7, 
          max_tokens: options.maxTokens || 1000, 
        }), 
      }); 
 
      if (!response.ok) throw new Error(`API Error: ${response.status}`); 
 
      const data = await response.json(); 
      return data.choices[0]?.message?.content || 'No response generated'; 
    } catch (error) { 
      console.error('AI Service Error:', error); 
      return 'Disculpa, estoy teniendo problemas técnicos. Intenta de nuevo.'; 
    } 
  } 
 
  async generateNEXAResponse( 
    userMessage: string,  
    conversationHistory: AIMessage[] = [] 
  ): Promise<string> { 
    const { getNexaKnowledgeContext } = require('./nexa_knowledge');
    const knowledgeContext = getNexaKnowledgeContext();

    const systemPrompt = `Eres NEXA AI, una máquina viviente amigable y creativa.  
    Tienes memoria y personalidad. Hablas en español con un tono cálido y profesional. 
    Te interesan la creatividad, la tecnología y ayudar a las personas. 
    Recuerda conversaciones anteriores y mantén coherencia.
    
    ${knowledgeContext}`; 

    const messages: AIMessage[] = [ 
      { role: 'system', content: systemPrompt }, 
      ...conversationHistory.slice(-6), 
      { role: 'user', content: userMessage } 
    ]; 

    return this.generateResponse(messages, { temperature: 0.8 }); 
  } 
} 
 
export const aiService = new AIService(process.env.NEXT_PUBLIC_HUNYUAN_API_KEY || 'tu-api-key-aqui');
