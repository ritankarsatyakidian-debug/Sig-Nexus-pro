
import React, { useState, useEffect } from 'react';

interface Props {
  onStart: () => void;
}

const MainMenu: React.FC<Props> = ({ onStart }) => {
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const logs = [
      "> Initializing SIG-NEXUS Secure Boot...",
      "> Establishing Encrypted Mesh Handshake...",
      "> Loading Neural Strategist Arrays...",
      "> Calibrating Nano-Atomic Forge...",
      "> Synchronizing Energy Grid Harmonics...",
      "> Verifying Lead Architect Credentials...",
      "> BREACH DETECTION SYSTEM: ACTIVE",
      "> ACCESS GRANTED."
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logs.length) {
        setBootLog(prev => [...prev, logs[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#020617] text-[#e2e8f0] font-mono flex flex-col items-center justify-center overflow-hidden">
      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0b1120] border-2 border-cyan-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
              <h2 className="text-xl font-black tracking-tighter uppercase italic">Operational Directive</h2>
            </div>
            
            <div className="space-y-4 text-xs lg:text-sm text-slate-400 leading-relaxed font-sans mb-8">
              <p><span className="text-cyan-400 font-bold">1. MESH PROTOCOL:</span> Deploy High-Gain Relays to establish peer connectivity. Watch for real-time packet data flow between active nodes.</p>
              <p><span className="text-green-400 font-bold">2. ENERGY SMITH:</span> Drag components from the sidebar to the grid. Maintain stability by balancing Generation (Fusion/Solar) against Load (Data/Industrial).</p>
              <p><span className="text-purple-400 font-bold">3. NANO BUILDER:</span> Forge molecular structures by bonding atoms. Drag elements onto the canvas and link them to create stable compounds.</p>
              <p><span className="text-pink-400 font-bold">4. STRATEGIST CHAT:</span> Access the elite AI council for technical advice. Use the sidebar to switch between experts like Ritankar or Ibhan.</p>
              <p><span className="text-yellow-400 font-bold">5. NEXUS AUDIT:</span> Use the AI Analysis tool in any mode to get real-time optimization strategies for your current build.</p>
            </div>

            <button 
              onClick={() => setShowInstructions(false)}
              className="w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Sync & Initialize
            </button>
          </div>
        </div>
      )}

      {/* Cinematic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-2 h-full w-full p-4">
          {Array(400).fill(0).map((_, i) => (
            <div key={i} className="h-1 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: `${i * 10}ms` }}></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl px-6">
        <div className="mb-12 relative group">
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none select-none">
            SIG<span className="text-cyan-500">-</span>NEXUS
            <div className="text-xl lg:text-2xl font-light tracking-[0.5em] text-slate-500 mt-2">PRO EDITION</div>
          </h1>
        </div>

        <div className="space-y-8 w-full">
          <button 
            onClick={onStart}
            className="group relative px-12 py-5 bg-transparent border border-cyan-500/30 rounded-full overflow-hidden transition-all hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] active:scale-95"
          >
            <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative text-sm font-black tracking-[0.4em] uppercase text-cyan-400 group-hover:text-white transition-colors">Enter Forge</span>
          </button>

          <div className="flex flex-col items-center">
            <button 
              onClick={() => setShowLog(!showLog)}
              className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors mb-4"
            >
              [ {showLog ? 'Hide' : 'Show'} Boot Logs ]
            </button>
            
            {showLog && (
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-left h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-300 backdrop-blur-md">
                {bootLog.map((log, i) => (
                  <div key={i} className="text-[10px] text-cyan-500/70 mb-1 font-mono">{log}</div>
                ))}
                <div className="w-2 h-4 bg-cyan-500/50 animate-pulse inline-block"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-8 flex items-center gap-3">
        <div className="w-8 h-[1px] bg-slate-800"></div>
        <span className="text-[9px] text-slate-600 tracking-[0.3em] font-light">NEXUS_OS_STABLE</span>
      </div>
    </div>
  );
};

export default MainMenu;
