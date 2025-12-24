
import React from 'react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isLabsUnlocked: boolean;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode, isLabsUnlocked }) => {
  return (
    <header className="h-16 bg-[#151e2e] border-b border-[#334155] px-6 flex items-center justify-between z-50">
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold tracking-widest flex items-center gap-2">
          SIGMESH <span className="text-blue-500 font-extrabold">FORGE NEXUS</span>
        </div>
        <div className="hidden md:flex px-3 py-1 bg-green-900/30 border border-green-700 text-green-400 text-xs rounded-full animate-pulse uppercase tracking-tighter">
          Secure Mesh Active
        </div>
      </div>

      <nav className="flex items-center h-full">
        <TabButton 
          active={mode === 'MESH'} 
          label="Secure Mesh" 
          onClick={() => setMode('MESH')} 
          activeColor="border-blue-500"
        />
        <TabButton 
          active={mode === 'ENERGY'} 
          label="Energy Smith" 
          onClick={() => setMode('ENERGY')} 
          activeColor="border-green-500"
        />
        <TabButton 
          active={mode === 'NANO'} 
          label="Nano Builder" 
          onClick={() => setMode('NANO')} 
          activeColor="border-purple-500"
        />
        <TabButton 
          active={mode === 'AI_CHAT'} 
          label="AI Strategists" 
          onClick={() => setMode('AI_CHAT')} 
          activeColor="border-pink-500"
        />
        {isLabsUnlocked && (
           <TabButton 
             active={mode === 'LABS'} 
             label="Experimental Labs" 
             onClick={() => setMode('LABS')} 
             activeColor="border-yellow-500"
           />
        )}
      </nav>
    </header>
  );
};

const TabButton: React.FC<{ active: boolean, label: string, onClick: () => void, activeColor: string }> = ({ active, label, onClick, activeColor }) => (
  <button 
    onClick={onClick}
    className={`h-full px-6 text-sm font-semibold transition-all border-b-2 ${active ? `${activeColor} text-white bg-white/5` : 'border-transparent text-[#64748b] hover:text-white hover:bg-white/5'}`}
  >
    {label.toUpperCase()}
  </button>
);

export default Header;
