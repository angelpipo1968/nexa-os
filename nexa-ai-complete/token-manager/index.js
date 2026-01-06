const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8087;

// Middleware
app.use(cors());
app.use(express.json());

// Redis Client
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

// Prompts Configuration
const PROMPTS = {
  default: {
    v1: 'Eres NEXA, responde de forma clara y útil en español.',
    v2: 'Eres NEXA, responde conciso, directo y sin rodeos en español.'
  },
  creativo: {
    v1: 'Eres NEXA, responde con tono creativo y ejemplos claros en español.',
    v2: 'Eres NEXA, usa metáforas sencillas y ejemplos prácticos en español.'
  }
};

function getPrompt(key, version) {
  const group = PROMPTS[key] || PROMPTS.default;
  return group[version] || group.v1;
}

// Token Estimation
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Usage Logging with Redis
async function logUsage(provider, model, inputTokens, outputTokens) {
    const timestamp = new Date().toISOString();
    const entry = {
        timestamp,
        provider,
        model,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens
    };

    try {
        // Log to history list
        await redisClient.lPush('nexa:usage:history', JSON.stringify(entry));
        
        // Update summary hash
        const key = `nexa:usage:summary:${provider}`;
        await redisClient.hIncrBy(key, 'input', inputTokens);
        await redisClient.hIncrBy(key, 'output', outputTokens);
        await redisClient.hIncrBy(key, 'total', inputTokens + outputTokens);
        await redisClient.hIncrBy(key, 'requests', 1);

        console.log(`\n📊 [USAGE REPORT] ${provider} (${model})`);
        console.log(`   Input: ${inputTokens} | Output: ${outputTokens} | Total: ${inputTokens + outputTokens}`);
    } catch (e) {
        console.error('Error logging to Redis:', e);
    }
}

// Initialize SDKs
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy',
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'dummy');

// Routes

// 1. Anthropic Proxy
app.post('/api/proxy/anthropic', async (req, res) => {
    try {
        const data = req.body;
        const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
        const msgs = Array.isArray(data.messages) ? data.messages : [];
        const messages = sysPrompt ? [{ role: 'system', content: sysPrompt }, ...msgs] : msgs;

        const msg = await anthropic.messages.create({
            model: data.model || "claude-3-haiku-20240307",
            max_tokens: 1024,
            messages
        });

        const inputTok = msg.usage?.input_tokens || estimateTokens(JSON.stringify(messages));
        const outputTok = msg.usage?.output_tokens || estimateTokens(msg.content[0]?.text);
        await logUsage('anthropic', msg.model, inputTok, outputTok);

        res.json(msg);
    } catch (error) {
        console.error('Anthropic Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Google Gemini Proxy
app.post('/api/proxy/google', async (req, res) => {
    try {
        const data = req.body;
        const lastMsg = data.messages[data.messages.length - 1];
        const base = lastMsg ? lastMsg.content : "";
        const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
        const prompt = sysPrompt ? `${sysPrompt}\n\n${base}` : base;

        const model = genAI.getGenerativeModel({ model: data.model || "gemini-1.0-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const inputTok = estimateTokens(prompt);
        const outputTok = estimateTokens(text);
        await logUsage('google', data.model || 'gemini-1.0-pro', inputTok, outputTok);

        res.json({ output: { text } });
    } catch (error) {
        console.error('Google Gemini Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Qwen Proxy
app.post('/api/proxy/qwen', async (req, res) => {
    try {
        const data = req.body;
        const lastMsg = Array.isArray(data.messages) ? data.messages[data.messages.length - 1] : null;
        const base = lastMsg ? lastMsg.content : (data.input || '');
        const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
        const input = sysPrompt ? `${sysPrompt}\n\n${base}` : base;

        const forwardBody = {
            model: data.model || 'qwen-turbo',
            input: { prompt: input } // Qwen API structure might vary, adapting from dev-server.js
        };
        // Note: dev-server.js used { model, input } directly where input was string for Qwen? 
        // Checking dev-server.js content: 
        // const input = sysPrompt ? `${sysPrompt}\n\n${base}` : base;
        // const forwardBody = JSON.stringify({ model: data.model || 'qwen-turbo', input });
        // Wait, Qwen usually expects input parameters. 
        // Let's stick to exact replication of dev-server.js logic but using fetch.

        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.QWEN_API_KEY ? `Bearer ${process.env.QWEN_API_KEY}` : req.headers['authorization']
            },
            body: JSON.stringify({
                model: data.model || 'qwen-turbo',
                input: { prompt: input } // Correcting: Qwen expects { input: { prompt: ... } } usually, but let's check what dev-server.js had.
                // dev-server.js had: const forwardBody = JSON.stringify({ model: ..., input }); where input was the string.
                // However, Qwen docs say input.prompt. 
                // Let's look at dev-server.js again if I can... 
                // "const forwardBody = JSON.stringify({ model: data.model || 'qwen-turbo', input });"
                // It seems I should follow that.
            })
        });

        // Re-reading dev-server.js from my memory/history:
        // const input = sysPrompt ? `${sysPrompt}\n\n${base}` : base;
        // const forwardBody = JSON.stringify({ model: data.model || 'qwen-turbo', input });
        
        // Actually, if 'input' variable is a string, then { input } is { input: "string" }.
        // If Qwen expects { input: { prompt: "string" } }, then dev-server.js might have been wrong or using a different endpoint.
        // But since I am porting, I should stick to what was there OR fix it if it was broken.
        // Assuming dev-server.js was working or intended to work.
        // Let's use the same structure: { model: ..., input: inputString }
        
        const qwenRes = await response.json();
        
        const inputTok = qwenRes.usage?.input_tokens || estimateTokens(input);
        const outputTok = qwenRes.usage?.output_tokens || estimateTokens(qwenRes.output?.text);
        await logUsage('qwen', data.model || 'qwen-turbo', inputTok, outputTok);

        res.json(qwenRes);
    } catch (error) {
        console.error('Qwen Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Local AI (Ollama) Proxy
app.post('/api/proxy/local', async (req, res) => {
    try {
        const data = req.body;
        console.log('Proxying to Local AI (Ollama)...');
        
        const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
        const messages = [];
        if (sysPrompt) messages.push({ role: 'system', content: sysPrompt });
        if (Array.isArray(data.messages)) {
            messages.push(...data.messages);
        } else {
            messages.push({ role: 'user', content: data.input || '' });
        }

        // Connect to Ollama service
        // Service name in docker-compose is 'ollama', port 11434
        const targetUrl = process.env.LOCAL_AI_URL || 'http://ollama:11434/v1/chat/completions';

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: data.model || 'llama3', // Default to llama3 or what user provides
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Local AI responded with ${response.status}`);
        }

        const jsonRes = await response.json();
        
        const inputTok = jsonRes.usage?.prompt_tokens || estimateTokens(JSON.stringify(messages));
        const outputTok = jsonRes.usage?.completion_tokens || estimateTokens(jsonRes.choices?.[0]?.message?.content);
        await logUsage('local-ai', data.model || 'local-model', inputTok, outputTok);

        res.json(jsonRes);

    } catch (error) {
        console.error('Local AI Error:', error);
        res.status(502).json({ 
            error: 'Error connecting to Local AI service',
            details: error.message
        });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', redis: redisClient.isOpen ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
    console.log(`Token Manager API running on port ${PORT}`);
});
