
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isLabsUnlocked: boolean;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode, isLabsUnlocked }) => {
  return (
    <header className="h-14 lg:h-16 bg-[#0b1120] border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between z-[50] shadow-2xl relative overflow-hidden">
      <div className="flex items-center gap-4 lg:gap-8 shrink-0">
        <div className="flex items-center gap-2 lg:gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <span className="text-white font-black text-lg lg:text-xl">S</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-[11px] lg:text-sm font-black tracking-[2px] lg:tracking-[3px] uppercase">
              SIG<span className="text-cyan-500">NEXUS</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex items-center h-full overflow-x-auto no-scrollbar scroll-smooth ml-2 lg:ml-0">
        <div className="flex h-full min-w-max items-center">
          <TabButton active={mode === 'MESH'} label="Mesh" icon="📡" onClick={() => setMode('MESH')} activeColor="text-blue-400 border-blue-500" />
          <TabButton active={mode === 'ENERGY'} label="Grid" icon="⚡" onClick={() => setMode('ENERGY')} activeColor="text-green-400 border-green-500" />
          <TabButton active={mode === 'NANO'} label="Nano" icon="⚛️" onClick={() => setMode('NANO')} activeColor="text-purple-400 border-purple-500" />
          <TabButton active={mode === 'AI_CHAT'} label="Chat" icon="🧠" onClick={() => setMode('AI_CHAT')} activeColor="text-pink-400 border-pink-500" />
          {isLabsUnlocked && (
            <TabButton active={mode === 'LABS'} label="Labs" icon="🧪" onClick={() => setMode('LABS')} activeColor="text-yellow-400 border-yellow-500" />
          )}
        </div>
      </nav>
      
      <div className="hidden md:flex items-center gap-4 ml-4 shrink-0">
        <div className="text-right">
           <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Sys_Status</div>
           <div className="text-[9px] font-mono text-slate-400">ACTIVE</div>
        </div>
      </div>
    </header>
  );
};

const TabButton: React.FC<{ active: boolean, label: string, icon: string, onClick: () => void, activeColor: string }> = ({ active, label, icon, onClick, activeColor }) => (
  <button 
    onClick={onClick}
    className={`h-full px-4 lg:px-6 flex items-center gap-2 lg:gap-3 transition-all border-b-2 font-mono group relative shrink-0 ${active ? `${activeColor} bg-white/5` : 'border-transparent text-slate-500 hover:text-white'}`}
  >
    <span className={`text-sm lg:text-base ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap`}>{label}</span>
  </button>
);

export default Header;
