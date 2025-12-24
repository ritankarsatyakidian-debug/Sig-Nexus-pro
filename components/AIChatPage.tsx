
import React, { useState, useEffect, useRef } from 'react';
import { AI_CHARACTERS } from '../constants';
import { AICharacter } from '../types';
import { generateAIResponse } from '../services/geminiService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AIChatPage: React.FC<{ onMessageSent: () => void, openTerminal: () => void }> = ({ onMessageSent, openTerminal }) => {
  const [selectedAI, setSelectedAI] = useState<AICharacter>(AI_CHARACTERS[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, selectedAI, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    if (inputText.trim().toLowerCase() === '/terminal') {
      openTerminal();
      setInputText('');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [selectedAI.id]: [...(prev[selectedAI.id] || []), userMsg]
    }));
    setInputText('');
    setIsTyping(true);
    onMessageSent();

    const responseText = await generateAIResponse(selectedAI.id, inputText);
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [selectedAI.id]: [...(prev[selectedAI.id] || []), aiMsg]
    }));
    setIsTyping(false);
  };

  const currentMessages = messages[selectedAI.id] || [];

  return (
    <div className="flex h-full bg-[#0b1120] text-white overflow-hidden">
      {/* Left Column: Strategist Selector */}
      <div className="w-80 bg-[#151e2e] border-r border-[#334155] flex flex-col shadow-2xl z-10">
        <div className="p-8 border-b border-[#334155] bg-gradient-to-br from-slate-800 to-transparent">
          <h2 className="text-[10px] font-black text-[#64748b] uppercase tracking-[3px]">Nexus Strategists</h2>
          <p className="text-[9px] text-slate-500 mt-1">SELECT ENCRYPTED CHANNEL</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {AI_CHARACTERS.map(ai => (
            <button
              key={ai.id}
              onClick={() => setSelectedAI(ai)}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all group ${selectedAI.id === ai.id ? 'bg-blue-600/10 ring-1 ring-blue-500/50 shadow-inner shadow-blue-500/10' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
            >
              <div className={`text-3xl p-2 rounded-full bg-[#0b1120] border border-[#334155] group-hover:scale-110 transition-transform ${selectedAI.id === ai.id ? 'border-blue-500/50' : ''}`}>
                {ai.avatar}
              </div>
              <div className="text-left">
                <div className="text-xs font-black tracking-tight">{ai.name.toUpperCase()}</div>
                <div className="text-[9px] text-[#64748b] uppercase font-mono">{ai.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Active Conversation */}
      <div className="flex-1 flex flex-col bg-[#0f172a] relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        {/* Active Header */}
        <div className="h-20 border-b border-[#334155] flex items-center px-8 bg-[#151e2e]/80 backdrop-blur-xl z-10">
          <span className="text-4xl mr-5 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{selectedAI.avatar}</span>
          <div>
            <h3 className="font-black text-sm tracking-widest">{selectedAI.name.toUpperCase()}</h3>
            <p className="text-[10px] text-slate-500 font-mono tracking-tighter italic">{selectedAI.description}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[8px] text-green-500 font-mono">SECURE_TUNNEL_ESTABLISHED</span>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative">
          {currentMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="text-6xl mb-6 opacity-20 filter grayscale">{selectedAI.avatar}</div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Encrypted Greeting Awaited</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed italic">The nexus strategist is ready to provide mission-critical insights. Initiate the handshake protocol below.</p>
            </div>
          )}
          {currentMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
              <div className={`max-w-[75%] p-5 rounded-2xl text-xs leading-relaxed shadow-xl ${msg.sender === 'user' ? 'bg-blue-600/10 border border-blue-500/40 text-blue-50 ml-12 rounded-tr-none' : `bg-[#151e2e] border ${selectedAI.accent.split(' ')[0]} text-slate-200 mr-12 rounded-tl-none`}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start animate-pulse">
               <div className="bg-[#151e2e] p-5 rounded-2xl text-[10px] font-mono text-slate-500 italic">
                 {selectedAI.name.toUpperCase()} PROCESSING SIGNAL...
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Interface */}
        <div className="p-6 bg-[#151e2e] border-t border-[#334155] z-10">
          <div className="max-w-5xl mx-auto flex gap-4">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`COMMAND ${selectedAI.name.toUpperCase()}...`}
              className="flex-1 bg-[#0b1120] border border-[#334155] rounded-xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:opacity-30"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping}
              className="px-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-xl font-black text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <span>SEND</span>
              <span className="opacity-50">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
