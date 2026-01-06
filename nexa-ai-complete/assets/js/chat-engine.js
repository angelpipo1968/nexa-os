class ChatEngine {
  constructor(selector, apiConfig = {}) {
    this.container = document.querySelector(selector);
    this.history = [];
    this.apiConfig = {
      endpoint: apiConfig.endpoint || 'https://api.openai.com/v1/chat/completions', // Example default
      apiKey: apiConfig.apiKey || '',
      model: apiConfig.model || 'gpt-3.5-turbo'
    };
  }

  async sendMessage(message) {
    this.addMessage(message, 'user');
    
    if (this.apiConfig.apiKey) {
      await this.callAI(message);
    } else {
      this.simulateTyping();
    }
  }

  async callAI(userMessage) {
    try {
      // Placeholder for loading state
      const loadingId = this.addLoadingIndicator();
      
      let response;
      
      // Check if using Anthropic (Claude)
      if (this.apiConfig.endpoint.includes('anthropic')) {
        response = await fetch(this.apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiConfig.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: this.apiConfig.model || 'claude-3-opus-20240229',
            max_tokens: 1024,
            messages: [{ role: 'user', content: userMessage }]
          })
        });
      } else {
        // Default to OpenAI Standard
        response = await fetch(this.apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiConfig.apiKey}`
          },
          body: JSON.stringify({
            model: this.apiConfig.model,
            messages: [{ role: 'user', content: userMessage }]
          })
        });
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.removeMessage(loadingId);
      
      // Adapt based on API response structure
      let aiText = "Respuesta recibida";
      
      if (data.content && data.content[0] && data.content[0].text) {
        // Anthropic Response
        aiText = data.content[0].text;
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        // OpenAI Response
        aiText = data.choices[0].message.content;
      }
      
      this.addMessage(aiText, 'assistant');
      
    } catch (error) {
      console.error("API Error:", error);
      this.removeMessage(this.loadingId); // Ensure loading is removed
      let errorMsg = "Error al conectar con la IA.";
      if (error.message.includes('Failed to fetch')) {
        errorMsg += " (Posible bloqueo CORS: usa una extensión 'Allow CORS' para probar localmente)";
      }
      this.addMessage(errorMsg, 'system');
    }
  }

  addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = 'chat-message assistant animate-pulse';
    msgDiv.innerHTML = `<div class="message-content"><p>Escribiendo...</p></div>`;
    this.container.appendChild(msgDiv);
    this.container.scrollTop = this.container.scrollHeight;
    return id;
  }

  removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  addMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role} animate-slide-in`;
    msgDiv.innerHTML = `
      <div class="message-content">
        <p>${text}</p>
        <span class="timestamp">${new Date().toLocaleTimeString()}</span>
      </div>
    `;
    this.container.appendChild(msgDiv);
    this.container.scrollTop = this.container.scrollHeight;
    this.history.push({ role, text, timestamp: new Date() });
  }

  simulateTyping() {
    // Show typing indicator
    setTimeout(() => {
      this.addMessage("Procesando tu solicitud con Qwen3 (Simulación)...", 'assistant');
    }, 1000);
  }
}
