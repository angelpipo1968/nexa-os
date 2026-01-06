const fs = require('fs');
const path = require('path');

// --- CONSTANTS & CONFIG ---
const MEMORY_FILE = path.join(__dirname, 'user_memory.json');

// --- MEMORY SYSTEM ---
class MemorySystem {
    constructor() {
        this.ensureMemoryFile();
        this.memory = this.loadMemory();
    }

    ensureMemoryFile() {
        if (!fs.existsSync(MEMORY_FILE)) {
            fs.writeFileSync(MEMORY_FILE, JSON.stringify({
                user_profile: {
                    name: "User",
                    preferences: {},
                    notes: []
                },
                facts: [],
                last_interaction: null
            }, null, 2));
        }
    }

    loadMemory() {
        try {
            return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
        } catch (e) {
            console.error("Error loading memory:", e);
            return { user_profile: {}, facts: [] };
        }
    }

    saveMemory() {
        try {
            fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
        } catch (e) {
            console.error("Error saving memory:", e);
        }
    }

    getSystemPromptAddition() {
        const profile = this.memory.user_profile;
        const facts = this.memory.facts.slice(-5); // Last 5 facts
        
        return `
[PERSISTENT MEMORY]
User Name: ${profile.name || 'User'}
Preferences: ${JSON.stringify(profile.preferences)}
Recent Key Facts:
${facts.map(f => `- ${f}`).join('\n')}
-------------------
[INSTRUCTIONS]
You are Nexa, an intelligent OS assistant.
- You have access to the above MEMORY. Use it to personalize answers.
- If the user tells you a new name, preference, or important fact, output a tool call: [MEMORY_SAVE: "the fact to save"]
- If you need to search the web, output: [SEARCH: "query"]
- If you need news, output: [NEWS: "topic"]
- If you need images, output: [IMAGE: "query"]
`;
    }

    addFact(fact) {
        // Simple deduplication
        if (!this.memory.facts.includes(fact)) {
            this.memory.facts.push(fact);
            // Limit to 50 facts
            if (this.memory.facts.length > 50) this.memory.facts.shift();
            this.saveMemory();
            console.log(`[Memory] Learned: ${fact}`);
        }
    }

    updateProfile(key, value) {
        this.memory.user_profile[key] = value;
        this.saveMemory();
    }
}

// --- AGENT ORCHESTRATOR ---
class AgentOrchestrator {
    constructor(memorySystem, services) {
        this.memory = memorySystem;
        this.services = services; // { search, news, images }
    }

    // Detect tool calls in the LLM response
    parseToolCalls(text) {
        const tools = [];
        const regex = /\[(SEARCH|NEWS|IMAGE|MEMORY_SAVE):\s*"([^"]+)"\]/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            tools.push({
                type: match[1],
                query: match[2],
                fullMatch: match[0]
            });
        }
        return tools;
    }

    async executeTool(tool) {
        console.log(`[Agent] Executing Tool: ${tool.type} -> ${tool.query}`);
        try {
            switch (tool.type) {
                case 'SEARCH':
                    if (this.services.search) {
                        const res = await this.services.search.search(tool.query);
                        return `[SEARCH RESULT for "${tool.query}"]: ${JSON.stringify(res.slice(0, 3))}`;
                    }
                    return "[SEARCH ERROR: Service not available]";
                
                case 'NEWS':
                    if (this.services.news) {
                        const res = await this.services.news.getTopHeadlines(tool.query !== 'general' ? tool.query : null);
                        return `[NEWS RESULT]: ${JSON.stringify(res.slice(0, 3))}`;
                    }
                    return "[NEWS ERROR: Service not available]";

                case 'IMAGE':
                    // Image generation usually just returns a URL to display, we don't need to feed it back to LLM text flow necessarily, 
                    // but for the "Agent" to know it succeeded:
                    return `[IMAGE GENERATED: User can see the image dashboard]`;

                case 'MEMORY_SAVE':
                    this.memory.addFact(tool.query);
                    return `[MEMORY SAVED: "${tool.query}"]`;
                
                default:
                    return `[UNKNOWN TOOL: ${tool.type}]`;
            }
        } catch (e) {
            return `[TOOL ERROR: ${e.message}]`;
        }
    }
}

module.exports = { MemorySystem, AgentOrchestrator };
