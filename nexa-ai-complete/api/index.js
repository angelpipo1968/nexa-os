const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { Anthropic } = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cheerio = require('cheerio');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Auth Middleware
function authMiddleware(req, res, next) {
  const apiKey = process.env.NEXA_API_KEY;
  const secret = process.env.NEXA_TOKEN_SECRET || 'dev-secret';
  const keyHeader = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];

  // Allow Vercel cron or internal calls if needed, but for now strict check
  if (apiKey && keyHeader && keyHeader === apiKey) return next();

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token === 'local-key') return next();
    
    try {
      jwt.verify(token, secret);
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  }
  // For demo/mobile access, we might want to be lenient or ensure the frontend sends 'local-key'
  // ChatInterface sends 'Bearer local-key', so we are good.
  return res.status(401).json({ error: 'No autorizado' });
}

// --- SERVICES (Copied/Adapted from token-vm/server.js) ---

class WebSearchService {
  constructor() {
    this.engines = [
      { name: 'duckduckgo', fn: this.searchDuckDuckGo.bind(this) },
      { name: 'searxng', fn: this.searchSearXNG.bind(this) }
    ];
  }

  async search(query) {
    for (const engine of this.engines) {
      try {
        const results = await engine.fn(query);
        if (results && results.length > 0) return this.processResults(results);
      } catch (e) { console.error(`Error with ${engine.name}:`, e.message); }
    }
    return this.getFallbackResults(query);
  }

  processResults(results) {
    const unique = new Map();
    results.forEach(r => { if (!unique.has(r.link)) unique.set(r.link, r); });
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
      if (i >= 5) return;
      const title = $(el).find('.result__a').text().trim();
      const link = $(el).find('.result__a').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();
      if (title && link) results.push({ title, link, snippet, source: 'DuckDuckGo' });
    });
    return results;
  }

  async searchSearXNG(query) {
    const instances = ['https://searx.be/search', 'https://search.ononoki.org/search'];
    for (const baseUrl of instances) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${baseUrl}?q=${encodeURIComponent(query)}&format=json`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        clearTimeout(timeout);
        if (!response.ok) continue;
        const data = await response.json();
        if (data.results) return data.results.slice(0, 5).map(r => ({ title: r.title, link: r.url, snippet: r.content, source: 'SearXNG' }));
      } catch (e) { /* continue */ }
    }
    return [];
  }

  getFallbackResults(query) {
    return [{ title: `Búsqueda: ${query}`, link: 'https://duckduckgo.com', snippet: 'Resultados no disponibles en tiempo real.', source: 'System' }];
  }
}

class ImageService {
    constructor() { this.apiKey = process.env.UNSPLASH_ACCESS_KEY; }
    async search(query) {
        if (!this.apiKey) return { error: 'UNSPLASH_ACCESS_KEY not configured' };
        try {
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5`, {
                headers: { 'Authorization': `Client-ID ${this.apiKey}` }
            });
            if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
            const data = await res.json();
            return data.results.map(img => ({
                id: img.id, description: img.description || img.alt_description, url: img.urls.regular, thumb: img.urls.small, photographer: img.user.name, link: img.links.html
            }));
        } catch (e) { return { error: e.message }; }
    }
}

class NewsService {
    constructor() { this.apiKey = process.env.NEWS_API_KEY; }
    async getNews(query) {
        if (!this.apiKey) return { error: 'NEWS_API_KEY not configured' };
        try {
            const url = query ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${this.apiKey}` : `https://newsapi.org/v2/top-headlines?country=us&apiKey=${this.apiKey}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`NewsAPI error: ${res.status}`);
            const data = await res.json();
            return data.articles.slice(0, 5).map(art => ({
                title: art.title, description: art.description, url: art.url, image: art.urlToImage, source: art.source.name, publishedAt: art.publishedAt
            }));
        } catch (e) { return { error: e.message }; }
    }
}

// Initialize Services
const searchService = new WebSearchService();
const imageService = new ImageService();
const newsService = new NewsService();

// Import Agent System (Using relative path)
// We need to be careful with paths. If we are in /api/index.js, token-vm is in ../token-vm
const { MemorySystem, AgentOrchestrator } = require('../token-vm/agent-system');
const memorySystem = new MemorySystem();
const agentOrchestrator = new AgentOrchestrator(memorySystem, {
    search: searchService, news: newsService, images: imageService
});

// --- API ROUTES ---

// 1. Anthropic Proxy (from dev-server.js)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy' });
app.post('/api/proxy/anthropic', async (req, res) => {
    try {
        const data = req.body;
        const msg = await anthropic.messages.create({
            model: data.model || "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages: data.messages
        });
        res.json(msg);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Google Gemini Proxy (from dev-server.js)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'dummy');
app.post('/api/proxy/google', async (req, res) => {
    try {
        const data = req.body;
        const lastMsg = data.messages[data.messages.length - 1];
        const prompt = lastMsg ? lastMsg.content : "";
        const model = genAI.getGenerativeModel({ model: data.model || "gemini-1.0-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ output: { text: text } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Web Search Endpoint (Token VM)
app.post('/api/v1/web/search', authMiddleware, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });
        const results = await searchService.search(query);
        res.json({ results });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. Chat Completions (Token VM - The Main Logic)
app.post('/api/v1/chat/completions', authMiddleware, async (req, res) => {
    try {
        const messages = req.body.messages || [];
        const model = req.body.model || 'phi3:mini';
        
        // Inject Memory
        if (messages.length > 0 && messages[0].role === 'system') {
            messages[0].content += memorySystem.getSystemPromptAddition();
        } else {
            messages.unshift({ role: 'system', content: memorySystem.getSystemPromptAddition() });
        }

        // Qwen Style params
        const { temperature, max_new_tokens, top_p, repetition_penalty } = req.body;

        // Determine Provider
        if (model === 'groq') {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: messages,
                    temperature: temperature || 0.7,
                    max_tokens: max_new_tokens || 1024,
                    top_p: top_p || 1
                })
            });
            if (!groqRes.ok) throw new Error(`Groq Error: ${groqRes.statusText}`);
            const groqData = await groqRes.json();
            
            // Agent Processing
            const aiText = groqData.choices[0]?.message?.content || "";
            const toolResult = await agentOrchestrator.processResponse(aiText);
            
            // Return modified response if tools were used
            if (toolResult !== aiText) {
                groqData.choices[0].message.content = toolResult;
            }
            return res.json(groqData);
        }
        
        // Fallback to Gemini (if Groq fails or selected)
        if (model === 'gemini-flash-latest') {
             const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
             // Convert messages to Gemini format (simplified)
             const lastMsg = messages[messages.length - 1].content;
             const result = await geminiModel.generateContent(lastMsg);
             const response = await result.response;
             return res.json({ choices: [{ message: { content: response.text() } }] });
        }

        // Default: Mock/Local fallback
        res.json({ choices: [{ message: { content: "Local/Mock Response: Server running on Vercel." } }] });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Export the app
module.exports = app;

// Start server if running locally
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API Server running locally on port ${PORT}`);
  });
}
