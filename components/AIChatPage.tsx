
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

const AIChatPage: React.FC<{ 
  onMessageSent: () => void, 
  openTerminal: () => void,
  onTriggerSatyaki: () => void 
}> = ({ onMessageSent, openTerminal, onTriggerSatyaki }) => {
  const [selectedAI, setSelectedAI] = useState<AICharacter>(AI_CHARACTERS[0]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, selectedAI, isTyping]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    if (trimmed.toLowerCase() === '/terminal') {
      openTerminal();
      setInputText('');
      return;
    }

    // Satyaki Easter Egg
    if (selectedAI.id === 'satyaki' && trimmed.toUpperCase() === 'INFINITY FORCE') {
      onTriggerSatyaki();
      setInputText('');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => ({ ...prev, [selectedAI.id]: [...(prev[selectedAI.id] || []), userMsg] }));
    setInputText('');
    setIsTyping(true);
    onMessageSent();

    const responseText = await generateAIResponse(selectedAI.id, trimmed);
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => ({ ...prev, [selectedAI.id]: [...(prev[selectedAI.id] || []), aiMsg] }));
    setIsTyping(false);
  };

  const currentMessages = messages[selectedAI.id] || [];

  return (
    <div className="flex h-full bg-[#020617] text-white overflow-hidden relative">
      <div className={`fixed lg:relative z-[120] lg:z-10 h-full w-64 bg-[#0b1120] border-r border-slate-800 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Councils</h2>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {AI_CHARACTERS.map(ai => (
            <button
              key={ai.id}
              onClick={() => { setSelectedAI(ai); if(window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedAI.id === ai.id ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-900 opacity-60'}`}
            >
              <span className="text-xl">{ai.avatar}</span>
              <div className="text-left">
                <div className="text-[10px] font-black uppercase truncate">{ai.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#020617] relative">
        <div className="h-14 border-b border-slate-800 flex items-center px-4 bg-[#0b1120]/80 backdrop-blur-xl">
          <button className="lg:hidden p-2 mr-3 bg-slate-800 rounded-lg" onClick={() => setSidebarOpen(true)}>🧠</button>
          <span className="text-xl mr-3">{selectedAI.avatar}</span>
          <h3 className="font-black text-xs tracking-widest uppercase">{selectedAI.name}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {currentMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-xs ${msg.sender === 'user' ? 'bg-slate-800 border border-slate-700' : 'bg-slate-900 border border-slate-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-[10px] text-slate-500 italic animate-pulse">ANALYZING...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="max-w-3xl mx-auto relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inject command... (Try /terminal)"
              className="w-full bg-[#0b1120] border border-slate-800 rounded-2xl pl-5 pr-12 py-3 text-xs focus:outline-none focus:border-cyan-500/50"
            />
            <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500">🚀</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
