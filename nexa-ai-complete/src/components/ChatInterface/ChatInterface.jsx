import React, { useState } from 'react';
import { Layout, Input, Button, Avatar, Typography, Select, Space, Card, Tag } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, RocketOutlined, GlobalOutlined } from '@ant-design/icons';
import { Bot, Globe } from 'lucide-react';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy NEXA, tu asistente AI multi-proveedor. ¿En qué puedo ayudarte hoy?', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('anthropic'); // 'anthropic' | 'qwen' | 'google'
  const [promptKey, setPromptKey] = useState('default');
  const [promptVersion, setPromptVersion] = useState('v1');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMsg = { role: 'user', content: inputValue, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setLoading(true);

    try {
      let endpoint = 'http://localhost:3002/v1/chat/completions';
      let body = {};
      let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer local-key'
      };

      // Handle Provider Routing
      if (selectedModel === 'anthropic') {
        endpoint = 'http://localhost:8087/api/proxy/anthropic';
        body = {
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: newMsg.content }],
          prompt_key: promptKey,
          prompt_version: promptVersion
        };
      } else {
        // Unified Token VM (Groq, Gemini, Local)
         let modelId = 'phi3:mini'; // Default local
         if (selectedModel === 'groq') modelId = 'groq'; // Server maps this to Llama 3.3
         if (selectedModel === 'google') modelId = 'gemini-flash-latest';
         if (selectedModel === 'qwen-style') modelId = 'groq'; // Use Groq for speed but with Qwen style config
         if (selectedModel === 'local') modelId = 'phi3:mini'; // Or user preference
 
         // Inject Web Search Context (Agent Mode)
         let finalContent = newMsg.content;
         let messagesPayload = messages.concat({ ...newMsg, content: finalContent }).map(m => ({ 
            role: m.role === 'user' ? 'user' : 'assistant', 
            content: m.content 
         }));

         if (selectedModel === 'qwen-style') {
             // Inject Qwen Style System Prompt
             const systemPrompt = "Eres un asistente conversacional eficiente, claro y directo. Responde con precisión, usando listas o pasos si es necesario. Mantén un tono amigable pero profesional.";
             messagesPayload.unshift({ role: 'system', content: systemPrompt });
             
             body = {
               model: modelId,
               messages: messagesPayload,
               temperature: 0.7,
               max_new_tokens: 256,
               top_p: 0.9,
               repetition_penalty: 1.1
             };
         } else {
            body = {
              model: modelId,
              messages: messagesPayload
            };
         }

         if (webSearchEnabled) {
           try {
              setMessages(prev => [...prev, {
                role: 'system',
                content: '🔍 Buscando en la web...',
                timestamp: new Date().toLocaleTimeString()
              }]);
 
              const searchRes = await fetch('/api/v1/web/search', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ query: newMsg.content })
              });
              
              if (searchRes.ok) {
                 const searchData = await searchRes.json();
                 if (searchData.results && searchData.results.length > 0) {
                   const context = searchData.results.map(r => `[${r.title}](${r.link}): ${r.snippet}`).join('\n\n');
                   // Update the last user message in payload
                   const lastUserMsg = messagesPayload[messagesPayload.length - 1];
                   lastUserMsg.content = `INFORMACIÓN DE BÚSQUEDA WEB RECIENTE:\n${context}\n\nINSTRUCCIÓN: Usa la información anterior para responder a la siguiente pregunta del usuario. Cita las fuentes si es relevante.\n\nPREGUNTA USUARIO: ${newMsg.content}`;
                 }
              }
           } catch (e) {
              console.error("Web Search Error:", e);
           }
         }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let aiText = '';

      if (data.choices && data.choices[0] && data.choices[0].message) {
        aiText = data.choices[0].message.content;
      } else if (data.content && data.content[0] && data.content[0].text) {
        aiText = data.content[0].text;
      } else if (data.output && data.output.text) {
        aiText = data.output.text;
      } else {
        aiText = typeof data === 'string' ? data : JSON.stringify(data);
      }

      // Clean up Tool Tags from UI
      const cleanText = aiText
        .replace(/\[MEMORY_SAVE:.*?\]/g, '')
        .replace(/\[SEARCH:.*?\]/g, '')
        .replace(/\[NEWS:.*?\]/g, '')
        .replace(/\[IMAGE:.*?\]/g, '')
        .trim();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanText || "✅ Operación completada internamente.",
        timestamp: new Date().toLocaleTimeString()
      }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `⚠️ Error de conexión: ${error.message}. Verifica que el servidor (Token VM) esté corriendo en el puerto 3002.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ height: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1e2e 100%)' }}>
      <Header style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        height: '72px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <Space size="large">
          <div style={{ 
            background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
            padding: '8px', 
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Bot color="white" size={24} />
          </div>
          <div>
            <Title level={4} style={{ color: 'white', margin: 0, fontSize: '1.2rem', letterSpacing: '0.5px' }}>
              NEXA <span style={{ fontWeight: 300, opacity: 0.8 }}>OS</span>
            </Title>
            <Text style={{ color: '#94a3b8', fontSize: '11px', display: 'block', lineHeight: 1 }}>
              Neural Experience AI
            </Text>
          </div>
          <Tag color="#10b981" style={{ border: 'none', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>ONLINE</Tag>
        </Space>
        
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.5)', 
          padding: '4px', 
          borderRadius: '12px', 
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: '8px'
        }}>
          <Select 
            defaultValue="groq" 
            style={{ width: 220 }} 
            onChange={setSelectedModel}
            variant="borderless"
            options={[
              { value: 'groq', label: '⚡ Llama 3.3 (Groq/Meta)' },
              { value: 'google', label: '✨ Gemini 2.0 Flash (Google)' },
              { value: 'anthropic', label: '🧠 Claude 3.5 Sonnet' },
              { value: 'qwen-style', label: '🧪 Qwen Style (Test)' },
              { value: 'local', label: '🔒 Local AI (Ollama)' },
            ]}
            dropdownStyle={{ background: '#1e293b', border: '1px solid #334155' }}
          />
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          <Select 
            defaultValue="default" 
            style={{ width: 140 }} 
            onChange={setPromptKey}
            variant="borderless"
            options={[
              { value: 'default', label: 'Modo: Asistente' },
              { value: 'creativo', label: 'Modo: Creativo' },
              { value: 'coder', label: 'Modo: Developer' }
            ]}
          />
        </div>

        <Space>
          <Button 
             type={webSearchEnabled ? "primary" : "text"}
             icon={<GlobalOutlined />}
             onClick={() => setWebSearchEnabled(!webSearchEnabled)}
             style={{ 
               background: webSearchEnabled ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
               color: webSearchEnabled ? '#34d399' : '#94a3b8',
               border: webSearchEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : 'none',
               borderRadius: '8px'
             }}
             title={webSearchEnabled ? "Búsqueda Web Activada" : "Activar Búsqueda Web"}
          />
        </Space>
      </Header>

      <Content style={{ padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex',
              justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start', 
              padding: '12px 0'
            }}>
              <div style={{ 
                maxWidth: '75%',
                display: 'flex',
                flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                gap: '12px'
              }}>
                <Avatar 
                  icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                  style={{ 
                    backgroundColor: item.role === 'user' ? '#6366f1' : '#10b981',
                    boxShadow: item.role === 'user' ? '0 0 10px rgba(99, 102, 241, 0.4)' : '0 0 10px rgba(16, 185, 129, 0.4)',
                    flexShrink: 0
                  }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    padding: '14px 18px',
                    borderRadius: item.role === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                    background: item.role === 'user' 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                      : 'rgba(30, 41, 59, 0.8)',
                    color: 'white',
                    boxShadow: item.role === 'user' 
                      ? '0 4px 15px rgba(99, 102, 241, 0.3)' 
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                    border: item.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                    fontSize: '15px',
                    lineHeight: '1.6'
                  }}>
                    {item.content}
                  </div>
                  <Text style={{ 
                    color: 'rgba(148, 163, 184, 0.8)', 
                    fontSize: '11px', 
                    marginTop: '6px',
                    padding: '0 4px'
                  }}>
                    {item.timestamp}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Content>

      <Footer style={{ background: 'transparent', padding: '24px' }}>
        <div style={{ 
          background: 'rgba(30, 41, 59, 0.6)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '16px', 
          padding: '8px', 
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          gap: '8px'
        }}>
          <Input 
            placeholder="Escribe tu mensaje..." 
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            variant="borderless"
            style={{ 
              background: 'transparent', 
              color: 'white', 
              fontSize: '15px',
              padding: '8px 16px'
            }}
          />
          <Button 
            type="primary" 
            icon={loading ? <RocketOutlined spin /> : <SendOutlined />} 
            onClick={handleSendMessage}
            loading={loading}
            size="large"
            style={{ 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              border: 'none',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
              padding: '0 24px',
              height: '45px'
            }}
          >
            Enviar
          </Button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Text style={{ color: '#475569', fontSize: '12px' }}>
            Nexa AI puede cometer errores. Verifica la información importante.
          </Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default ChatInterface;
