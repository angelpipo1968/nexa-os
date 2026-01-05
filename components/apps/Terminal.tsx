import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface TerminalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Terminal({ isOpen, onClose }: TerminalProps) {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<Array<{ cmd: string; output: string }>>([
        { cmd: '', output: 'NEXA OS v4.5.2 [Sovereign Edition]\n(c) 2026 NEXA Systems. All rights reserved.\n\nType "help" for a list of commands.' }
    ]);
    const [isMaximized, setIsMaximized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, history]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const executeCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim().toLowerCase();
        let output = '';

        switch (trimmedCmd) {
            case 'help':
                output = `
Available commands:
  help        Show this help message
  clear       Clear terminal output
  status      Show system status
  whoami      Show current user
  neofetch    Display system info
  date        Show current date/time
  matrix      Toggle Matrix mode (simulation)
  exit        Close terminal
        `;
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'status':
                output = 'SYSTEM ONLINE | MODE: OPEN SOURCE | SECURE: YES';
                break;
            case 'whoami':
                output = 'root@nexa-sovereign-node';
                break;
            case 'neofetch':
                output = `
       /\\        OS: NEXA OS Sovereign
      /  \\       Kernel: 5.15.0-generic
     / /\\ \\      Uptime: 42 days, 3 hours
    / ____ \\     Shell: nexa-bash 5.2
   /_/    \\_\\    CPU: Quantum Neural Engine v4
                  Memory: Infinite (Cloud Native)
        `;
                break;
            case 'date':
                output = new Date().toString();
                break;
            case 'matrix':
                output = 'Wake up, Neo... (Matrix mode simulation enabled within imagination matrix)';
                break;
            case 'exit':
                onClose();
                return;
            case '':
                output = '';
                break;
            default:
                output = `Command not found: ${cmd}`;
        }

        setHistory(prev => [...prev, { cmd, output }]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            executeCommand(input);
            setInput('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed z-50 flex items-center justify-center p-4 transition-all duration-300 ${isMaximized ? 'inset-0' : 'inset-0 md:inset-auto md:top-20 md:right-20 md:w-[600px] md:h-[400px]'}`}>
            <div className={`bg-black/90 backdrop-blur-md text-green-500 font-mono rounded-lg shadow-2xl border border-green-500/30 flex flex-col overflow-hidden w-full h-full ${isMaximized ? 'w-full h-full' : ''}`}>

                {/* Title Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-green-500/20">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="w-4 h-4" />
                        <span className="text-xs font-bold">root@nexa:~</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMaximized(!isMaximized)} className="hover:bg-green-500/20 p-1 rounded">
                            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                        </button>
                        <button onClick={onClose} className="hover:bg-red-500/20 p-1 rounded text-red-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Terminal Content */}
                <div
                    className="flex-1 p-4 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent"
                    ref={scrollRef}
                    onClick={() => inputRef.current?.focus()}
                >
                    {history.map((entry, i) => (
                        <div key={i} className="mb-2">
                            {entry.cmd && (
                                <div className="flex items-center gap-2 text-green-300">
                                    <span className="text-green-600">➜</span>
                                    <span className="text-blue-400">~</span>
                                    <span>{entry.cmd}</span>
                                </div>
                            )}
                            {entry.output && (
                                <div className="whitespace-pre-wrap ml-4 opacity-80">{entry.output}</div>
                            )}
                        </div>
                    ))}

                    <div className="flex items-center gap-2 text-green-300 mt-2">
                        <span className="text-green-600">➜</span>
                        <span className="text-blue-400">~</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent border-none outline-none flex-1 text-green-500 placeholder-green-800"
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
