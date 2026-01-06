const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });
const { Anthropic } = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PORT = 8087; // Changed to 8087 to avoid conflict

const MIMETYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

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

// Token Management Logic
const USAGE_FILE = 'usage.json';

// Simple estimation: ~4 chars per token
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function logUsage(provider, model, inputTokens, outputTokens) {
  let usageData = { history: [], summary: {} };
  
  // Read existing
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
  
  // Update Summary
  if (!usageData.summary[provider]) usageData.summary[provider] = { input: 0, output: 0, total: 0, requests: 0 };
  usageData.summary[provider].input += inputTokens;
  usageData.summary[provider].output += outputTokens;
  usageData.summary[provider].total += (inputTokens + outputTokens);
  usageData.summary[provider].requests += 1;

  // Write back
  fs.writeFileSync(USAGE_FILE, JSON.stringify(usageData, null, 2));
  
  console.log(`\n📊 [USAGE REPORT] ${provider} (${model})`);
  console.log(`   Input: ${inputTokens} | Output: ${outputTokens} | Total: ${inputTokens + outputTokens}`);
  console.log(`   Total Requests: ${usageData.summary[provider].requests}`);
}

function getPrompt(key, version) {
  const group = PROMPTS[key] || PROMPTS.default;
  return group[version] || group.v1;
}

// Initialize SDKs
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy', // Prevent crash if missing, handle in request
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'dummy');

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper to read body
  const readBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

  // API: Anthropic (via SDK)
  if (req.url === '/api/proxy/anthropic' && req.method === 'POST') {
    try {
      const body = await readBody();
      const data = JSON.parse(body);
      const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
      const msgs = Array.isArray(data.messages) ? data.messages : [];
      const messages = sysPrompt ? [{ role: 'system', content: sysPrompt }, ...msgs] : msgs;
      
      console.log('Calling Anthropic SDK...');
      const msg = await anthropic.messages.create({
        model: data.model || "claude-3-haiku-20240307",
        max_tokens: 1024,
        messages
      });
      
      // Token Usage Log
      const inputTok = msg.usage?.input_tokens || estimateTokens(JSON.stringify(messages));
      const outputTok = msg.usage?.output_tokens || estimateTokens(msg.content[0]?.text);
      logUsage('anthropic', msg.model, inputTok, outputTok);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(msg));
    } catch (error) {
      console.error('Anthropic Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // API: Google Gemini (via SDK)
  if (req.url === '/api/proxy/google' && req.method === 'POST') {
    try {
      const body = await readBody();
      const data = JSON.parse(body);
      // Extract last user message for simple prompt
      const lastMsg = data.messages[data.messages.length - 1];
      const base = lastMsg ? lastMsg.content : "";
      const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
      const prompt = sysPrompt ? `${sysPrompt}\n\n${base}` : base;
      
      console.log('Calling Google Gemini SDK...');
      const model = genAI.getGenerativeModel({ model: data.model || "gemini-1.0-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Token Usage Log
      const inputTok = estimateTokens(prompt);
      const outputTok = estimateTokens(text);
      logUsage('google', data.model || 'gemini-1.0-pro', inputTok, outputTok);

      // Return consistent format
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ output: { text: text } })); 
    } catch (error) {
      console.error('Google Gemini Error:', error);
      if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('dummy')) {
          console.log('Using Gemini Fallback for testing...');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ output: { text: "Simulación Gemini (Modo Pruebas): El servicio no está disponible o la API Key es inválida, pero aquí tienes una respuesta simulada para validar la UI." } }));
          return;
      }
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // API: Image Search Proxy
  if (req.url === '/api/proxy/images' && req.method === 'POST') {
    try {
      const body = await readBody();
      console.log('Proxying Image Search request...');
      
      const targetUrl = new URL('http://localhost:3002/v1/images/search');
      
      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-key'
        }
      };
      
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      
      proxyReq.on('error', (e) => {
        console.error('Image Proxy Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });
      
      proxyReq.write(body);
      proxyReq.end();
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: News Proxy
  if (req.url === '/api/proxy/news' && req.method === 'POST') {
    try {
      const body = await readBody();
      console.log('Proxying News request...');
      
      const targetUrl = new URL('http://localhost:3002/v1/news');
      
      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-key'
        }
      };
      
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      
      proxyReq.on('error', (e) => {
        console.error('News Proxy Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });
      
      proxyReq.write(body);
      proxyReq.end();
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: Web Search Proxy
  if (req.url === '/api/proxy/web-search' && req.method === 'POST') {
    try {
      const body = await readBody();
      console.log('Proxying Web Search request...');
      
      const targetUrl = new URL('http://localhost:3002/v1/web/search');
      
      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-key'
        }
      };
      
      const searchReq = http.request(options, (searchRes) => {
        res.writeHead(searchRes.statusCode, searchRes.headers);
        searchRes.pipe(res);
      });
      
      searchReq.on('error', (e) => {
        console.error('Web Search Request Error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      });
      
      searchReq.write(body);
      searchReq.end();
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: Local AI (OpenAI Compatible)
  if (req.url === '/api/proxy/local' && req.method === 'POST') {
    try {
      const body = await readBody();
      console.log('Proxying request to Local AI...');
      const data = JSON.parse(body);
      const lastMsg = Array.isArray(data.messages) ? data.messages[data.messages.length - 1] : null;
      const base = lastMsg ? lastMsg.content : (data.input || '');
      const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
      
      // Reconstruct messages for OpenAI format
      // If sysPrompt exists, prepend it as system message
      const messages = [];
      if (sysPrompt) messages.push({ role: 'system', content: sysPrompt });
      if (Array.isArray(data.messages)) {
        messages.push(...data.messages);
      } else {
        messages.push({ role: 'user', content: base });
      }

      const forwardBody = JSON.stringify({
        model: data.model || 'local-model',
        messages: messages,
        temperature: 0.7,
        stream: data.stream || false // Forward stream flag
      });
      
      const targetUrl = new URL(process.env.LOCAL_AI_URL || 'http://localhost:1234/v1/chat/completions');
      
      const options = {
        hostname: targetUrl.hostname,
        port: targetUrl.port,
        path: targetUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer local-key' // Some servers require a dummy key
        }
      };
      
      const localReq = http.request(options, (localRes) => {
        console.log(`Local AI responded with status: ${localRes.statusCode}`);
        
        // Forward status and headers
        res.writeHead(localRes.statusCode, localRes.headers);

        // Pipe directly for streaming support
        localRes.pipe(res);

        // Optional: Accumulate for logging (non-blocking)
        let fullBody = '';
        localRes.on('data', chunk => {
             fullBody += chunk.toString();
        });

        localRes.on('end', () => {
             try {
                // If streaming, this might be a concatenation of SSE events, harder to parse for tokens
                // If normal JSON, we can parse it.
                if (!fullBody.startsWith('data:')) {
                    const jsonRes = JSON.parse(fullBody);
                    const inputTok = jsonRes.usage?.prompt_tokens || 0;
                    const outputTok = jsonRes.usage?.completion_tokens || 0;
                    logUsage('local-ai', data.model || 'local-model', inputTok, outputTok);
                } else {
                    // For SSE, counting tokens is harder without parsing every event.
                    // Simple estimate:
                    const outputTok = estimateTokens(fullBody);
                    logUsage('local-ai', data.model || 'local-model', 0, outputTok);
                }
             } catch(e) { console.log('Could not parse local usage for logging'); }
        });
      });

      localReq.on('error', (e) => {
        console.error('Local AI Request Error:', e);
        res.writeHead(502, { 'Content-Type': 'application/json' }); // 502 Bad Gateway
        res.end(JSON.stringify({ 
          error: `Error connecting to Local AI at ${targetUrl.toString()}. Is LM Studio/LocalAI running?`,
          details: e.message 
        }));
      });

      localReq.write(forwardBody);
      localReq.end();
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // API: Qwen (Raw HTTPS)
  if (req.url === '/api/proxy/qwen' && req.method === 'POST') {
    try {
      const body = await readBody();
      console.log('Proxying request to Qwen...');
      const data = JSON.parse(body);
      const lastMsg = Array.isArray(data.messages) ? data.messages[data.messages.length - 1] : null;
      const base = lastMsg ? lastMsg.content : (data.input || '');
      const sysPrompt = getPrompt(data.prompt_key, data.prompt_version);
      const input = sysPrompt ? `${sysPrompt}\n\n${base}` : base;
      const forwardBody = JSON.stringify({
        model: data.model || 'qwen-turbo',
        input
      });
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.QWEN_API_KEY ? `Bearer ${process.env.QWEN_API_KEY}` : req.headers['authorization']
        }
      };
      
      const qwenReq = https.request('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', options, (qwenRes) => {
        console.log(`Qwen responded with status: ${qwenRes.statusCode}`);
        let responseBody = '';
        qwenRes.on('data', chunk => responseBody += chunk);
        qwenRes.on('end', () => {
             // Try to parse usage
             try {
                const jsonRes = JSON.parse(responseBody);
                const inputTok = jsonRes.usage?.input_tokens || estimateTokens(input);
                const outputTok = jsonRes.usage?.output_tokens || estimateTokens(jsonRes.output?.text);
                logUsage('qwen', data.model || 'qwen-turbo', inputTok, outputTok);
             } catch(e) {}
             
             res.writeHead(qwenRes.statusCode, qwenRes.headers);
             res.end(responseBody);
        });
      });

      qwenReq.on('error', (e) => {
        console.error('Qwen Request Error:', e);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      });

      qwenReq.write(forwardBody);
      qwenReq.end();
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Static File Serving
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';

  const extname = path.extname(filePath);
  const contentType = MIMETYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code == 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server Error: '+error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Anthropic Proxy: http://localhost:${PORT}/api/proxy/anthropic`);
  console.log(`Google Proxy: http://localhost:${PORT}/api/proxy/google`);
  console.log(`Qwen Proxy: http://localhost:${PORT}/api/proxy/qwen`);
  console.log(`Local Proxy: http://localhost:${PORT}/api/proxy/local`);
});
