
import React, { useState, useEffect, useRef } from 'react';

const SecretTerminal: React.FC<{ onClose: () => void, onCommandResult?: (cmd: string) => void, toggleGlitch: () => void }> = ({ onClose, onCommandResult, toggleGlitch }) => {
  const [history, setHistory] = useState<string[]>(['SIG-NEXUS PRO ROOT v4.2', 'Authorized Access Only.']);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    let response = '';

    switch (cleanCmd) {
      case 'help': response = 'CMDS: STATUS, SCAN, LINGINFINITY, GLITCH, RITANKAR, SAANVI, CLEAR, EXIT\nTRIGGERS: BEL-IQ-Z, TAIQ, MOONWALK, SPIDERSTRANGE, POWERLINGX'; break;
      case 'status': response = 'KERNEL: OPTIMAL\nENCRYPTION: QUANTUM_OK'; break;
      case 'linginfinity': response = 'BYPASSING SECURITY... DIAN\'S LABS UNLOCKED.'; break;
      case 'glitch': toggleGlitch(); response = 'BREACH INITIATED.'; break;
      case 'ritankar': case 'spiderstrange': case 'powerlingx': response = 'FOUNDER KEY DETECTED. OPENING sigmax-infinity force NET.ExEz...'; break;
      case 'saanvi': response = 'BRIDGE LIBRARY ACCESS GRANTED.'; break;
      case 'bel-iq-z': case 'moonwalk': response = 'GRAVITY_UNIT_FAILURE: IBHAN DIPLOMACY ACTIVATED. OBJECTS DISPLACED.'; break;
      case 'taiq': case 'overclock': response = 'SOUMYADEEPTA TURBO MODE: 500% BOOST ACTIVATED.'; break;
      case 'clear': setHistory([]); return;
      case 'exit': onClose(); return;
      default: response = `ACCEPTED: ${cmd.toUpperCase()}`;
    }

    if (onCommandResult) onCommandResult(cmd);
    setHistory(prev => [...prev, `arch@nexus:~$ ${cmd}`, response]);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-[280px] h-[220px] bg-black border border-green-500/30 rounded-xl flex flex-col font-mono text-green-400 p-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-green-900/50 pb-2 mb-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
          </div>
          <span className="text-[7px] tracking-widest text-green-900 uppercase">Nexus_Console</span>
          <button onClick={onClose} className="hover:text-white transition-colors text-lg leading-none">×</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto text-[8px] space-y-1 custom-scrollbar">
          {history.map((line, i) => <div key={i}>{line}</div>)}
          <div className="flex items-center">
            <span className="mr-1.5 text-green-300 font-bold">$</span>
            <input 
              autoFocus 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter') { handleCommand(input); setInput(''); } }} 
              className="bg-transparent border-none outline-none flex-1 text-green-400" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretTerminal;
