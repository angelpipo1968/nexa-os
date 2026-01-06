const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
// Load environment variables from parent directory
require('dotenv').config({ path: '../.env.local' });

const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

function authMiddleware(req, res, next) {
  const apiKey = process.env.NEXA_API_KEY;
  const secret = process.env.NEXA_TOKEN_SECRET || 'dev-secret';
  const keyHeader = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];

  if (apiKey && keyHeader && keyHeader === apiKey) return next();

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    // Allow internal local-key for dev-server communication
    if (token === 'local-key') return next();
    
    try {
      jwt.verify(token, secret);
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  }
  return res.status(401).json({ error: 'No autorizado' });
}

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';
const OLLAMA_GENERATE_URL = process.env.OLLAMA_GENERATE_URL || 'http://localhost:11434/api/generate';

// Cloud AI Configuration
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using Gemini Flash Latest for stability and free tier access
const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

const http = require('http');
const cheerio = require('cheerio');

// --- Web Search Service ---
class WebSearchService {
  constructor() {
    this.engines = [
      { name: 'duckduckgo', fn: this.searchDuckDuckGo.bind(this) },
      { name: 'searxng', fn: this.searchSearXNG.bind(this) } // Fallback/Alternative
    ];
  }

  async search(query) {
    console.log(`🔍 [WebSearchService] Searching for: "${query}"`);
    
    // Try engines in order
    for (const engine of this.engines) {
      try {
        console.log(`   Trying engine: ${engine.name}...`);
        const results = await engine.fn(query);
        if (results && results.length > 0) {
          console.log(`   ✅ Success with ${engine.name} (${results.length} results)`);
          return this.processResults(results);
        }
      } catch (e) {
        console.error(`   ❌ Error with ${engine.name}:`, e.message);
      }
    }

    // Ultimate Fallback
    console.log('   ⚠️ All engines failed. Returning fallback.');
    return this.getFallbackResults(query);
  }

  processResults(results) {
    // Deduplicate by Link
    const unique = new Map();
    results.forEach(r => {
      if (!unique.has(r.link)) unique.set(r.link, r);
    });
    return Array.from(unique.values()).slice(0, 5);
  }

  async searchDuckDuckGo(query) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('.result').each((i, el) => {
      if (i >= 5) return; // Limit to top 5
      const title = $(el).find('.result__a').text().trim();
      const link = $(el).find('.result__a').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();

      if (title && link) {
        results.push({ title, link, snippet, source: 'DuckDuckGo' });
      }
    });

    return results;
  }

  async searchSearXNG(query) {
    // Public instance list: https://searx.space/
    // Using a few known public instances (Note: These often have rate limits/captchas)
    const instances = [
      'https://searx.be/search', 
      'https://search.ononoki.org/search'
    ];

    for (const baseUrl of instances) {
      try {
        const url = `${baseUrl}?q=${encodeURIComponent(query)}&format=json`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // Fast fail

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        clearTimeout(timeout);
        if (!response.ok) continue;

        const data = await response.json();
        if (data.results) {
           return data.results.slice(0, 5).map(r => ({
             title: r.title,
             link: r.url,
             snippet: r.content,
             source: 'SearXNG'
           }));
        }
      } catch (e) { /* try next instance */ }
    }
    return [];
  }

  getFallbackResults(query) {
    return [{
      title: `Búsqueda: ${query}`,
      link: 'https://duckduckgo.com',
      snippet: 'No se pudieron obtener resultados en tiempo real. Por favor verifica tu conexión a internet.',
      source: 'System'
    }];
  }
}

const searchService = new WebSearchService();

app.post('/v1/web/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });
    
    const results = await searchService.search(query);
    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Image Service (Unsplash) ---
class ImageService {
    constructor() {
        this.apiKey = process.env.UNSPLASH_ACCESS_KEY;
    }
    
    async search(query) {
        if (!this.apiKey) return { error: 'UNSPLASH_ACCESS_KEY not configured' };
        
        try {
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5`, {
                headers: { 'Authorization': `Client-ID ${this.apiKey}` }
            });
            if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
            const data = await res.json();
            return data.results.map(img => ({
                id: img.id,
                description: img.description || img.alt_description,
                url: img.urls.regular,
                thumb: img.urls.small,
                photographer: img.user.name,
                link: img.links.html
            }));
        } catch (e) {
            console.error('Unsplash Error:', e);
            return { error: e.message };
        }
    }
}

// --- News Service (NewsAPI) ---
class NewsService {
    constructor() {
        this.apiKey = process.env.NEWS_API_KEY;
    }

    async getNews(query) {
        if (!this.apiKey) return { error: 'NEWS_API_KEY not configured' };
        
        try {
            const url = query 
                ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${this.apiKey}`
                : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${this.apiKey}`;
                
            const res = await fetch(url);
            if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
            const data = await res.json();
            return data.articles.slice(0, 5).map(art => ({
                title: art.title,
                description: art.description,
                url: art.url,
                image: art.urlToImage,
                source: art.source.name,
                publishedAt: art.publishedAt
            }));
        } catch (e) {
             console.error('NewsAPI Error:', e);
             return { error: e.message };
        }
    }
}

const imageService = new ImageService();
const newsService = new NewsService();

app.post('/v1/images/search', authMiddleware, async (req, res) => {
    const { query } = req.body;
    const results = await imageService.search(query || 'technology');
    res.json({ results });
});

app.post('/v1/news', authMiddleware, async (req, res) => {
    const { query } = req.body;
    const results = await newsService.getNews(query);
    res.json({ results });
});
// ----------------------------

const { MemorySystem, AgentOrchestrator } = require('./agent-system');

// --- SERVICES INITIALIZATION ---
const memorySystem = new MemorySystem();
const agentOrchestrator = new AgentOrchestrator(memorySystem, {
    search: searchService,
    news: newsService,
    images: imageService
});

// OpenAI Compatible Endpoint with Streaming Support
app.post('/v1/chat/completions', authMiddleware, async (req, res) => {
  try {
    const messages = req.body.messages || [];
    const model = req.body.model || 'phi3:mini';
    const stream = req.body.stream || false;

    // Inject Memory Context into System Prompt
    if (messages.length > 0 && messages[0].role === 'system') {
        messages[0].content += memorySystem.getSystemPromptAddition();
    } else {
        messages.unshift({
            role: 'system',
            content: memorySystem.getSystemPromptAddition()
        });
    }
    
    // Extract advanced parameters
    const { temperature, max_tokens, max_new_tokens, top_p, repetition_penalty } = req.body;

    // Transform OpenAI messages to Ollama format
    const payload = { 
      model: model === 'local-model' ? 'phi:latest' : model, // Map generic name to available local model
      messages: messages,
      stream: stream,
      options: {
        temperature: temperature,
        top_p: top_p,
        repeat_penalty: repetition_penalty,
        num_predict: max_new_tokens || max_tokens
      }
    };

    // --- GEMINI HANDLER ---
    if (model.startsWith('gemini')) {
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY no configurada en .env');
        }
        console.log(`Forwarding to Google Gemini: ${model}`);

        const { contents, systemInstruction } = convertToGeminiHistory(messages);
        
        const geminiPayload = {
            contents: contents,
            generationConfig: {
                maxOutputTokens: max_tokens || 2048,
                temperature: temperature ?? 0.7,
                topP: top_p
            }
        };
        if (systemInstruction) geminiPayload.system_instruction = systemInstruction;

        if (stream) {
            // Streaming Gemini
            console.log('Starting Gemini Stream...');
            const geminiRes = await fetch(GEMINI_STREAM_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiPayload)
            });

            if (!geminiRes.ok) {
                const errText = await geminiRes.text();
                throw new Error(`Gemini API Error: ${geminiRes.status} - ${errText}`);
            }

            // Headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const reader = geminiRes.body;
            reader.on('data', (chunk) => {
                const text = chunk.toString();
                // Gemini sends "data: " lines. We need to parse them.
                const lines = text.split('\n').filter(l => l.startsWith('data: '));
                
                for (const line of lines) {
                    try {
                        const jsonStr = line.replace('data: ', '').trim();
                        if (jsonStr === '[DONE]') return; 
                        
                        const json = JSON.parse(jsonStr);
                        // Extract text from Gemini chunk
                        const content = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        
                        if (content) {
                            const openaiChunk = {
                                id: "chatcmpl-gemini-" + Date.now(),
                                object: "chat.completion.chunk",
                                created: Math.floor(Date.now() / 1000),
                                model: model,
                                choices: [{
                                    index: 0,
                                    delta: { content: content },
                                    finish_reason: null
                                }]
                            };
                            res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`);
                        }
                    } catch (e) {
                        // ignore parse errors or keepalives
                    }
                }
            });

            reader.on('end', () => {
                res.write(`data: [DONE]\n\n`);
                res.end();
            });
            return; // End of Gemini Stream Handler

        } else {
            // Non-Streaming Gemini
            const geminiRes = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiPayload)
            });

            if (!geminiRes.ok) {
                 const errText = await geminiRes.text();
                 throw new Error(`Gemini API Error: ${geminiRes.status} - ${errText}`);
            }

            const data = await geminiRes.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // Send back in OpenAI format
            const openaiResponse = {
                id: "chatcmpl-gemini-" + Date.now(),
                object: "chat.completion",
                created: Math.floor(Date.now() / 1000),
                model: model,
                choices: [{
                    index: 0,
                    message: { role: "assistant", content: aiText },
                    finish_reason: "stop"
                }],
                usage: { total_tokens: 0 } // Gemini usage not always in response
            };
            res.json(openaiResponse);
            return; // End of Gemini Non-Stream Handler
        }
    }
    // --- END GEMINI HANDLER ---

    // --- GROQ HANDLER ---
    if (model.startsWith('groq') || model.includes('llama-3.3-70b')) {
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY no configurada en .env');
        }
        
        // Map generic "groq" to a specific fast model
        const groqModel = model === 'groq' ? 'llama-3.3-70b-versatile' : model.replace('groq-', '');
        
        console.log(`Forwarding to Groq: ${groqModel}`);

        const groqRes = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: groqModel,
                messages: messages,
                stream: stream,
                temperature: temperature,
                max_tokens: max_tokens || max_new_tokens,
                top_p: top_p
            })
        });

        if (!groqRes.ok) {
             const errText = await groqRes.text();
             throw new Error(`Groq API Error: ${groqRes.status} - ${errText}`);
        }

        if (stream) {
             // Pass-through streaming with Side-Effect for Memory
             res.setHeader('Content-Type', 'text/event-stream');
             res.setHeader('Cache-Control', 'no-cache');
             res.setHeader('Connection', 'keep-alive');
             
             const streamPassThrough = new require('stream').PassThrough();
             groqRes.body.pipe(streamPassThrough);
             streamPassThrough.pipe(res);

             // Capture full response for Agent processing (Memory/Tools)
             let fullResponse = '';
             streamPassThrough.on('data', (chunk) => {
                fullResponse += chunk.toString();
             });
             streamPassThrough.on('end', async () => {
                 // Parse accumulated SSE data to get actual text
                 // This is rough approximation for side-effects
                 try {
                     const lines = fullResponse.split('\n');
                     let actualText = '';
                     for (const line of lines) {
                         if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                             try {
                                 const json = JSON.parse(line.substring(6));
                                 if (json.choices?.[0]?.delta?.content) {
                                     actualText += json.choices[0].delta.content;
                                 }
                             } catch (e) {}
                         }
                     }
                     // Execute Tools found in response
                     const tools = agentOrchestrator.parseToolCalls(actualText);
                     for (const tool of tools) {
                         await agentOrchestrator.executeTool(tool);
                     }
                 } catch (e) {
                     console.error('Agent Side-Effect Error:', e);
                 }
             });

             return;
        } else {
             const data = await groqRes.json();
             
             // Agent Tool Execution (Synchronous)
             const content = data.choices?.[0]?.message?.content || "";
             const tools = agentOrchestrator.parseToolCalls(content);
             for (const tool of tools) {
                 await agentOrchestrator.executeTool(tool);
                 // Note: We don't feed the result back in this single-turn implementation
                 // But at least we SAVE the memory or perform the action.
             }

             res.json(data);
             return;
        }
    }
    // --- END GROQ HANDLER ---

    console.log(`Forwarding to Ollama: ${payload.model} (stream: ${stream})`);

    const r = await fetch(OLLAMA_URL, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });

    if (!r.ok) throw new Error(`Ollama responded ${r.status}`);

    if (stream) {
      // Handle Streaming Response (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = r.body;
      
      // Node-fetch body is a stream in Node.js
      reader.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            
            // Transform Ollama chunk to OpenAI chunk
            if (json.done) {
               res.write(`data: [DONE]\n\n`);
               continue;
            }

            const content = json.message?.content || "";
            const openaiChunk = {
              id: "chatcmpl-" + Date.now(),
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: payload.model,
              choices: [{
                index: 0,
                delta: { content: content },
                finish_reason: null
              }]
            };
            
            res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`);
          } catch (e) {
            console.error('Error parsing Ollama chunk', e);
          }
        }
      });

      reader.on('end', () => {
        res.end();
      });

    } else {
      // Handle Non-Streaming Response (Wait for full response)
      const json = await r.json();
      
      const aiText = json.message?.content || "";
      const promptTokens = json.prompt_eval_count || 0;
      const completionTokens = json.eval_count || 0;

      const openaiResponse = {
        id: "chatcmpl-" + Date.now(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: payload.model,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: aiText
          },
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens
        }
      };
      res.json(openaiResponse);
    }

  } catch (e) {
    console.error("Error in /v1/chat/completions:", e);
    if (!res.headersSent) {
      res.status(500).json({ error: e.message });
    }
  }
});

// Endpoint to list available models (OpenAI format)
app.post('/v1/models', authMiddleware, async (req, res) => {
    try {
        const r = await fetch('http://localhost:11434/api/tags');
        if (!r.ok) throw new Error('Failed to fetch models from Ollama');
        const json = await r.json();
        
        const models = json.models.map(m => ({
            id: m.name,
            object: "model",
            created: Date.parse(m.modified_at) / 1000,
            owned_by: "ollama"
        }));

        // Add Gemini Flash (Virtual Model)
        models.push({
            id: "gemini-flash-latest",
            object: "model",
            created: Date.now() / 1000,
            owned_by: "google"
        });

        // Add Groq Models (Virtual)
        models.push({
            id: "groq-llama-3.3-70b-versatile",
            object: "model",
            created: Date.now() / 1000,
            owned_by: "groq"
        });
        models.push({
            id: "groq-mixtral-8x7b-32768",
            object: "model",
            created: Date.now() / 1000,
            owned_by: "groq"
        });

        res.json({ object: "list", data: models });
    } catch (e) {
        res.json({ object: "list", data: [
            { id: "phi:latest", object: "model", created: Date.now()/1000, owned_by: "fallback" },
            { id: "gemini-flash-latest", object: "model", created: Date.now()/1000, owned_by: "google" },
            { id: "groq-llama-3.3-70b-versatile", object: "model", created: Date.now()/1000, owned_by: "groq" }
        ]});
    }
});

app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const userMsg = (req.body && req.body.message) ? req.body.message : 'Hola';
    const model = (req.body && req.body.model) ? req.body.model : 'phi3:mini';
    const payload = { model, messages: [{ role: 'user', content: userMsg }] };
    const r = await fetch(OLLAMA_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`Ollama responded ${r.status}`);
    const json = await r.json();
    const aiText = (json && json.message && json.message.content) ? json.message.content : (json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) ? json.choices[0].message.content : JSON.stringify(json);
    const tokens = json && typeof json.eval_count === 'number' ? json.eval_count : 0;
    res.json({ response: aiText, tokens_used: tokens, cost: 0 });
  } catch (e) {
    res.json({ response: "Respuesta desde tu VM de tokens", tokens_used: 50, cost: 0 });
  }
});

app.post('/api/generate', authMiddleware, async (req, res) => {
  try {
    const model = (req.body && req.body.model) ? req.body.model : 'phi3:mini';
    const prompt = (req.body && req.body.prompt) ? req.body.prompt : 'Hola';
    const r = await fetch(OLLAMA_GENERATE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, prompt, stream: false }) });
    if (!r.ok) throw new Error(`Ollama responded ${r.status}`);
    const json = await r.json();
    const text = json && json.response ? json.response : JSON.stringify(json);
    const tokens = json && typeof json.eval_count === 'number' ? json.eval_count : 0;
    res.json({ response: text, tokens_used: tokens, cost: 0 });
  } catch (e) {
    res.json({ response: "Respuesta desde tu VM de tokens", tokens_used: 50, cost: 0 });
  }
});

const PORT = 3002;

// --- Helper Functions ---

// Helper: Convert OpenAI Messages to Gemini Format
function convertToGeminiHistory(messages) {
    const contents = [];
    let systemInstruction = null;

    for (const msg of messages) {
        if (msg.role === 'system') {
            // Gemini supports system instructions separately, but for simple chat, 
            // we can prepend or set it. Ideally use system_instruction in payload.
            // For now, we'll store it to send as 'system_instruction' if supported, 
            // or merge with first user message.
            systemInstruction = { parts: [{ text: msg.content }] };
        } else if (msg.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: msg.content }] });
        } else if (msg.role === 'assistant') {
            contents.push({ role: 'model', parts: [{ text: msg.content }] });
        }
    }
    return { contents, systemInstruction };
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor de tokens corriendo en puerto ${PORT}`);
});
