
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isLabsUnlocked: boolean;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode, isLabsUnlocked }) => {
  return (
    <header className="h-16 bg-[#0b1120] border-b border-slate-800 px-8 flex items-center justify-between z-50 shadow-2xl relative">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform shadow-cyan-500/20">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <div>
            <div className="text-sm font-black tracking-[3px] flex items-center gap-2">
              SIG<span className="text-cyan-500">NEXUS</span>
            </div>
            <div className="text-[9px] font-mono text-slate-500 tracking-tighter uppercase font-bold">Forge Systems Pro</div>
          </div>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-800 hidden lg:block"></div>
        
        <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-slate-900/50 rounded-full border border-slate-800/50">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Encryption_Tunnel: Established</span>
        </div>
      </div>

      <nav className="flex items-center h-full">
        <TabButton 
          active={mode === 'MESH'} 
          label="Mesh" 
          icon="📡"
          onClick={() => setMode('MESH')} 
          activeColor="text-blue-400 border-blue-500"
        />
        <TabButton 
          active={mode === 'ENERGY'} 
          label="Energy" 
          icon="⚡"
          onClick={() => setMode('ENERGY')} 
          activeColor="text-green-400 border-green-500"
        />
        <TabButton 
          active={mode === 'NANO'} 
          label="Nano" 
          icon="⚛️"
          onClick={() => setMode('NANO')} 
          activeColor="text-purple-400 border-purple-500"
        />
        <TabButton 
          active={mode === 'AI_CHAT'} 
          label="Strategists" 
          icon="🧠"
          onClick={() => setMode('AI_CHAT')} 
          activeColor="text-pink-400 border-pink-500"
        />
        {isLabsUnlocked && (
           <TabButton 
             active={mode === 'LABS'} 
             label="Labs" 
             icon="🧪"
             onClick={() => setMode('LABS')} 
             activeColor="text-yellow-400 border-yellow-500"
           />
        )}
      </nav>
      
      <div className="hidden xl:flex items-center gap-6 ml-4">
        <div className="text-right">
           <div className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">System Clock</div>
           <div className="text-[10px] font-mono text-slate-300">0x{Math.floor(Date.now()/1000).toString(16).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
};

const TabButton: React.FC<{ active: boolean, label: string, icon: string, onClick: () => void, activeColor: string }> = ({ active, label, icon, onClick, activeColor }) => (
  <button 
    onClick={onClick}
    className={`h-full px-6 flex items-center gap-3 transition-all border-b-2 font-mono group relative ${active ? `${activeColor} bg-white/5` : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'}`}
  >
    <span className={`text-sm transition-transform ${active ? 'scale-125' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className={`text-[10px] font-black uppercase tracking-widest hidden md:inline`}>{label}</span>
    {active && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-current shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>}
  </button>
);

export default Header;
