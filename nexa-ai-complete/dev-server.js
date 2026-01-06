const express = require('express');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { Anthropic } = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 8087;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Configuration ---
const USAGE_FILE = 'usage.json';
const PROMPTS = {
  default: {
    v1: 'Eres NEXA, responde de forma clara y útil en español.',
    v2: 'Eres NEXA, responde conciso, directo y sin rodeos en español.'
  }
};

// --- Helper Functions ---
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function logUsage(provider, model, inputTokens, outputTokens) {
  let usageData = { history: [], summary: {} };
  if (fs.existsSync(USAGE_FILE)) {
    try {
      usageData = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'));
    } catch (e) { console.error('Error reading usage log', e); }
  }

  const entry = {
    timestamp: new Date().toISOString(),
    provider,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens
  };

  usageData.history.push(entry);
  if (!usageData.summary[provider]) usageData.summary[provider] = { input: 0, output: 0, total: 0, requests: 0 };
  usageData.summary[provider].input += inputTokens;
  usageData.summary[provider].output += outputTokens;
  usageData.summary[provider].total += (inputTokens + outputTokens);
  usageData.summary[provider].requests += 1;

  fs.writeFileSync(USAGE_FILE, JSON.stringify(usageData, null, 2));
  console.log(`📊 [USAGE] ${provider} (${model}): In=${inputTokens} Out=${outputTokens}`);
}

function getPrompt(key, version) {
  const group = PROMPTS[key] || PROMPTS.default;
  return group[version] || group.v1;
}

// --- SDK Initialization ---
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy' });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'dummy');

// --- Routes ---

// 1. Local AI Proxy (Ollama)
app.post('/api/proxy/local', async (req, res) => {
  try {
    console.log('🤖 Proxying to Local AI (Ollama)...');
    const data = req.body;
    
    // Construct Prompt
    const lastMsg = Array.isArray(data.messages) ? data.messages[data.messages.length - 1] : null;
    const base = lastMsg ? lastMsg.content : (data.input || '');
    const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
    
    const messages = [];
    if (sysPrompt) messages.push({ role: 'system', content: sysPrompt });
    if (Array.isArray(data.messages)) {
      messages.push(...data.messages);
    } else {
      messages.push({ role: 'user', content: base });
    }

    // Forward to Ollama
    const targetUrl = new URL(process.env.LOCAL_AI_URL || 'http://localhost:11434/v1/chat/completions');
    const proxyReq = http.request({
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path: targetUrl.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res); // Stream directly
    });

    proxyReq.on('error', (e) => {
      console.error('❌ Local AI Error:', e.message);
      res.status(502).json({ 
        error: 'Error connecting to Local AI', 
        details: 'Ensure Ollama is running on port 11434.' 
      });
    });

    proxyReq.write(JSON.stringify({
      model: data.model || 'local-model',
      messages: messages,
      temperature: 0.7,
      stream: data.stream || false
    }));
    proxyReq.end();

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Video Service (Mock Implementation)
const upload = multer({ dest: 'uploads/' });

app.get('/api/video', (req, res) => {
  // Return list of available videos (Mock)
  res.json({
    videos: [
      { id: 'v1', title: 'Big Buck Bunny', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'v2', title: 'Elephants Dream', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' }
    ]
  });
});

app.post('/api/video/upload', upload.single('video'), (req, res) => {
  // Handle video upload (Mock)
  console.log('📹 Video Upload received:', req.file);
  res.json({ 
    success: true, 
    message: 'Video uploaded successfully (stored locally)', 
    fileId: req.file?.filename 
  });
});

// 3. Other Proxies (Anthropic, Gemini, Web Search)
app.post('/api/proxy/anthropic', async (req, res) => {
  try {
    const data = req.body;
    const msg = await anthropic.messages.create({
      model: data.model || "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: data.messages
    });
    res.json(msg);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/proxy/google', async (req, res) => {
  try {
    const data = req.body;
    const model = genAI.getGenerativeModel({ model: data.model || "gemini-1.0-pro" });
    const lastMsg = data.messages[data.messages.length - 1];
    const result = await model.generateContent(lastMsg.content);
    const response = await result.response;
    res.json({ output: { text: response.text() } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 4. Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), service: 'NEXA Backend' });
});

// 5. Static Files (Fallback)
app.use(express.static('.'));

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`\n🚀 NEXA Backend (Express) running on http://localhost:${PORT}`);
  console.log(`   - AI Proxy: /api/proxy/local`);
  console.log(`   - Video API: /api/video`);
  console.log(`   - Health: /health`);
});
