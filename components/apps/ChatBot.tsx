import React from 'react';
import NexaAssistant from '../NexaAssistant';
import { X, MessageSquare } from 'lucide-react';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatBot({ isOpen, onClose }: ChatBotProps) {
  if (!isOpen) return null;

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <span className="font-medium">Chat Robot (NEXA Assistant)</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <NexaAssistant />
      </div>
    </div>
  );
}
