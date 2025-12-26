
import React, { useState, useEffect } from 'react';

interface Props {
  onStart: () => void;
}

const MainMenu: React.FC<Props> = ({ onStart }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

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

  const handleStart = () => {
    onStart();
  };

  return (
    <div className="fixed inset-0 bg-[#020617] text-[#e2e8f0] font-mono flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
        <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-2 h-full w-full p-4">
          {Array(400).fill(0).map((_, i) => (
            <div key={i} className="h-1 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: `${i * 10}ms` }}></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl px-6">
        <div className="mb-12 relative group">
          <div className="absolute -inset-8 bg-cyan-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <h1 className="text-7xl font-black tracking-tighter leading-none select-none">
            SIG<span className="text-cyan-500">-</span>NEXUS
            <div className="text-2xl font-light tracking-[0.5em] text-slate-500 mt-2">PRO EDITION</div>
          </h1>
        </div>

        <div className="space-y-8 w-full">
          <button 
            onClick={handleStart}
            className="group relative px-12 py-5 bg-transparent border border-cyan-500/30 rounded-full overflow-hidden transition-all hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] active:scale-95"
          >
            <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative text-sm font-black tracking-[0.4em] uppercase text-cyan-400 group-hover:text-white transition-colors">Initialize Systems</span>
          </button>

          <div className="flex flex-col items-center">
            <button 
              onClick={() => setShowLog(!showLog)}
              className="text-[10px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors mb-4"
            >
              [ {showLog ? 'Hide' : 'Show'} System Diagnostics ]
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

        <div className="mt-20 grid grid-cols-3 gap-12 text-slate-500">
           <div className="text-center">
             <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Security</div>
             <div className="text-[9px] font-mono opacity-60">AES-X-256</div>
           </div>
           <div className="text-center">
             <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Uptime</div>
             <div className="text-[9px] font-mono opacity-60">99.999%</div>
           </div>
           <div className="text-center">
             <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-400">Mesh</div>
             <div className="text-[9px] font-mono opacity-60">P2P_VOID</div>
           </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-8 flex items-center gap-3">
        <div className="w-8 h-[1px] bg-slate-800"></div>
        <span className="text-[9px] text-slate-600 tracking-[0.3em] font-light">FORGE_NEXUS_OS_STABLE</span>
      </div>

      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <span className="text-[9px] text-slate-600 tracking-[0.3em] font-light uppercase">Unauthorized access is logged</span>
        <div className="w-8 h-[1px] bg-slate-800"></div>
      </div>
    </div>
  );
};

export default MainMenu;
