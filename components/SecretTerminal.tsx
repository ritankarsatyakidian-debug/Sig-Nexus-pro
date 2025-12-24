
import React, { useState, useEffect, useRef } from 'react';

const SecretTerminal: React.FC<{ onClose: () => void, toggleGlitch: () => void }> = ({ onClose, toggleGlitch }) => {
  const [history, setHistory] = useState<string[]>([
    'SIG-NEXUS TERMINAL v4.2.0-STABLE',
    'ENCRYPTION: QUANTUM_RSA_8192',
    'AUTHORIZED ACCESS ONLY.',
    '',
    'Type "help" for available protocols.',
    ''
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    let response = '';

    switch (cleanCmd) {
      case 'help':
        response = 'AVAILABLE COMMANDS: HELP, STATUS, SCAN, DECRYPT, DIAN, EASTER, GLITCH, MATRIX, CLEAR, HACK, WISDOM, EXIT';
        break;
      case 'status':
        response = 'SYSTEM: [OPTIMAL]\nMESH: [SYNCED]\nENERGY: [94.2% EFFICIENCY]\nNANO: [VOID_STABLE]\nSECURITY: [AES-256-GCM]\nGPS: [LOCALIZED]';
        break;
      case 'scan':
        response = 'SCANNING MESH LAYERS...\nFOUND: RITANKAR (ARCHITECT)\nFOUND: IBHAN (STRATEGIST)\nFOUND: SOUMYADEEPTA (ENGINEER)\nFOUND: SAANVI (BRIDGE)\nFOUND: SATYAKI (DEFENSE)\nFOUND: DIAN (EXPERIMENTAL)\nFOUND: [PEER_REMOTE_0x4F2]';
        break;
      case 'decrypt':
        response = 'DECRYPTING VOID_PACKET_7...\n"The grid is a cages of our own making. Reality lies in the glitches between the lines."\nCOORDINATES: 22.5726° N, 88.3639° E';
        break;
      case 'dian':
        response = 'DIAN_MOCK_OS: "Hey architect. You found the back door. Don\'t tell Ritankar, he hates when I mess with the root shell. Everything is code, but not all code is stable."';
        break;
      case 'easter':
        response = 'HINTS:\n1. Use /terminal in any AI chat.\n2. Ctrl+Shift+G for the visual breach.\n3. Ctrl+Shift+L to access the Black Labs.\n4. Type "matrix" here for enlightenment.';
        break;
      case 'glitch':
        response = 'INITIATING REALITY BREACH...';
        toggleGlitch();
        break;
      case 'matrix':
        response = 'You are the architect of a world built on signals. If you change the signal, you change the world. The grid is not the truth, it is the filter.';
        break;
      case 'hack':
        response = 'ACCESS DENIED. :) Your attempt has been logged and laughed at by Dian. Nice try, Architect.';
        break;
      case 'wisdom':
        const quotes = [
          "Ritankar: 'Simplicity is the soul of scalability.'",
          "Satyaki: 'A silent system is a suspicious system.'",
          "Saanvi: 'Complexity is just an unexplained simplicity.'",
          "Soumyadeepta: 'Entropy is the only true constant in power systems.'"
        ];
        response = quotes[Math.floor(Math.random() * quotes.length)];
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'exit':
        onClose();
        return;
      default:
        response = `PROTOCOL ERROR: ${cmd.toUpperCase()} NOT RECOGNIZED.`;
    }

    setHistory(prev => [...prev, `nexus_arch@forge:~$ ${cmd}`, response, '']);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-3xl h-[500px] bg-black border border-green-500/50 rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.1)] flex flex-col font-mono text-green-400 p-6 relative overflow-hidden ring-1 ring-green-500/20">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.2)_0%,transparent_100%)]"></div>
        
        <div className="flex justify-between items-center border-b border-green-900/50 pb-3 mb-4">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
          </div>
          <span className="text-[10px] tracking-widest text-green-800">SIG-NEXUS ROOT CONSOLE</span>
          <button onClick={onClose} className="text-green-500 hover:text-white transition-all text-xl leading-none">×</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 text-xs leading-relaxed custom-scrollbar pr-2">
          {history.map((line, i) => (
            <div key={i} className={`whitespace-pre-wrap ${line.includes('DIAN:') ? 'text-purple-400' : ''}`}>
              {line}
            </div>
          ))}
          <div className="flex items-center text-green-300">
            <span className="mr-2 font-bold animate-pulse">nexus_arch@forge:~$</span>
            <input 
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleCommand(input);
                  setInput('');
                }
              }}
              className="bg-transparent border-none outline-none flex-1 text-green-400 caret-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretTerminal;
