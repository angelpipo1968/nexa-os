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
      
      const response = await fetch(this.apiConfig.endpoint, {
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

      const data = await response.json();
      this.removeMessage(loadingId);
      
      // Adapt based on API response structure (example for OpenAI)
      const aiText = data.choices?.[0]?.message?.content || "Respuesta recibida";
      this.addMessage(aiText, 'assistant');
      
    } catch (error) {
      console.error("API Error:", error);
      this.addMessage("Error al conectar con la IA. Verifica tu configuración.", 'system');
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
