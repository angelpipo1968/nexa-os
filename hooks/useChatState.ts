import { useState, useRef, useEffect } from 'react';
import { db } from '../lib/database-service';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../lib/supabase';

export function useChatState() {
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversations, setConversations] = useState<Array<{ id: string, title: string, date: string, messages: any[] }>>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Get user from context to handle cloud persistence
    const { user } = useAuth();

    // 1. Initial Load (Local + Cloud Sync)
    useEffect(() => {
        const savedHistory = localStorage.getItem('nexa_conversations');
        if (savedHistory) {
            try { setConversations(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
        }
        
        // If user is logged in, sync with Supabase
        if (user) {
            syncConversationsWithCloud(user.id);
        }
    }, [user]);

    // 2. Local Persistence (Always backup to localStorage)
    useEffect(() => { localStorage.setItem('nexa_chat_history', JSON.stringify(messages)); }, [messages]);
    useEffect(() => { localStorage.setItem('nexa_conversations', JSON.stringify(conversations)); }, [conversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    // --- Cloud Sync Logic ---
    const syncConversationsWithCloud = async (userId: string) => {
        try {
            const cloudConvos = await db.getUserConversations(userId);
            // Simple merge: prefer cloud for now, or merge lists. 
            // For this implementation, we will fetch cloud conversations and map them to our state structure
            const mappedConvos = cloudConvos.map(c => ({
                id: c.id,
                title: c.title,
                date: new Date(c.updated_at).toLocaleDateString(),
                messages: [] // We load messages on demand
            }));
            
            // Merge with local (avoid duplicates by ID)
            setConversations(prev => {
                const combined = [...mappedConvos];
                prev.forEach(p => {
                    if (!combined.find(c => c.id === p.id)) {
                        combined.push(p);
                    }
                });
                return combined;
            });
        } catch (error) {
            console.error("Error syncing conversations:", error);
        }
    };

    const loadConversation = async (id: string) => {
        // Try to find in local state first
        const chat = conversations.find(c => c.id === id);
        
        // If user is logged in, fetch full messages from cloud
        if (user) {
            setIsLoading(true);
            try {
                const cloudMessages = await db.getConversationMessages(id);
                if (cloudMessages && cloudMessages.length > 0) {
                     const formattedMessages = cloudMessages.map(m => ({
                         role: m.role,
                         content: m.content
                     }));
                     setMessages(formattedMessages);
                     setCurrentChatId(id);
                     setIsLoading(false);
                     return;
                }
            } catch (e) {
                console.error("Error loading cloud messages:", e);
            }
            setIsLoading(false);
        }

        // Fallback to local
        if (chat) {
            setMessages(chat.messages || []);
            setCurrentChatId(id);
        }
    };

    const stopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            setMessages(prev => [...prev, { role: 'system', content: '⏹️ Generación cancelada' }]);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setInput('');
        setCurrentChatId(null);
    };

    const startNewChat = async () => {
        // If there are messages, save the current one first
        if (messages.length > 0) {
            // Logic to save current chat if needed (already handled by real-time save usually, but let's ensure structure)
            const title = messages[0].content.substring(0, 30) + '...';
            
            if (user && !currentChatId) {
                // Create new conversation in cloud
                const newConvo = await db.createConversation(user.id, title);
                if (newConvo) {
                    // Save all current messages to this new conversation
                    for (const msg of messages) {
                        await db.saveMessage({
                            conversation_id: newConvo.id,
                            role: msg.role as 'user' | 'assistant',
                            content: msg.content,
                            metadata: {}
                        });
                    }
                    // Update state
                    const newChatState = {
                        id: newConvo.id,
                        title: newConvo.title,
                        date: new Date().toLocaleDateString(),
                        messages: [...messages]
                    };
                    setConversations(prev => [newChatState, ...prev]);
                    setCurrentChatId(newConvo.id);
                }
            } else if (!user) {
                // Local only
                const newChat = {
                    id: Date.now().toString(),
                    title: title,
                    date: new Date().toLocaleDateString(),
                    messages: [...messages]
                };
                setConversations(prev => [newChat, ...prev]);
            }
        }
        
        clearChat();
    };

    const deleteConversation = (id: string) => {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (currentChatId === id) clearChat();
        // TODO: Delete from cloud if user is logged in (method not yet in DB service interface provided in snippet, but good to add)
    };

    // Helper to save a single message
    const saveMessageToCloud = async (role: 'user' | 'assistant', content: string) => {
        if (!user) return;

        let targetChatId = currentChatId;

        // If no chat ID exists, create a conversation first
        if (!targetChatId) {
            const title = content.substring(0, 30) + '...';
            const newConvo = await db.createConversation(user.id, title);
            if (newConvo) {
                targetChatId = newConvo.id;
                setCurrentChatId(targetChatId);
                // Add to local list
                setConversations(prev => [{
                    id: newConvo.id,
                    title: newConvo.title,
                    date: new Date().toLocaleDateString(),
                    messages: []
                }, ...prev]);
            } else {
                return; // Failed to create conversation
            }
        }

        // Save message
        if (targetChatId) {
            await db.saveMessage({
                conversation_id: targetChatId,
                role,
                content,
                metadata: {}
            });
        }
    };

    return {
        messages, setMessages,
        input, setInput,
        isLoading, setIsLoading,
        conversations, setConversations,
        currentChatId, setCurrentChatId,
        messagesEndRef,
        stopGeneration,
        startNewChat,
        loadConversation,
        deleteConversation,
        clearChat,
        abortControllerRef,
        saveMessageToCloud // Exported to be used by UI when sending/receiving
    };
}
