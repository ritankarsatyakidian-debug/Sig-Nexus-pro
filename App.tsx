
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainCanvas from './components/MainCanvas';
import AIChatPage from './components/AIChatPage';
import SecretTerminal from './components/SecretTerminal';
import AchievementPanel from './components/AchievementPanel';
import { AppMode, Achievement, MeshNode, MeshMessage } from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('MESH');
  const [glitchMode, setGlitchMode] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [isLabsUnlocked, setIsLabsUnlocked] = useState(false);
  
  // Mesh Chat state
  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [meshMessages, setMeshMessages] = useState<MeshMessage[]>([]);
  
  // Ref to hold the function that grabs current simulation data
  const getSimDataRef = useRef<() => any>(() => ({}));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Easter Egg Combos
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setGlitchMode(prev => !prev);
        unlockAchievement('glitch_hunter');
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setIsLabsUnlocked(true);
        setMode('LABS');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const alreadyUnlocked = prev.find(a => a.id === id)?.unlocked;
      if (alreadyUnlocked) return prev;
      return prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
    });
  };

  const handleSendMeshMessage = (targetId: string, text: string) => {
    const msg: MeshMessage = {
      senderId: 'ME',
      targetId,
      text,
      timestamp: Date.now()
    };
    setMeshMessages(prev => [...prev, msg]);
    // Call globally exposed broadcast function from MainCanvas
    if ((window as any).sendMeshMessage) {
      (window as any).sendMeshMessage(targetId, text);
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${glitchMode ? 'glitch-active' : ''} bg-[#0b1120] text-[#e2e8f0]`}>
      <Header mode={mode} setMode={setMode} isLabsUnlocked={isLabsUnlocked} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {mode !== 'AI_CHAT' && mode !== 'LABS' && (
          <Sidebar 
            mode={mode} 
            getSimData={() => getSimDataRef.current()}
            onAction={(actionId) => {
               if (actionId === 'ping') unlockAchievement('first_ping');
            }}
            selectedMeshNode={selectedNode}
            meshMessages={meshMessages.filter(m => m.senderId === selectedNode?.id || m.targetId === selectedNode?.id)}
            onSendMeshMessage={handleSendMeshMessage}
            onCloseMeshChat={() => setSelectedNode(null)}
          />
        )}
        
        <main className="flex-1 relative bg-[#0f172a] overflow-hidden">
          {mode === 'AI_CHAT' ? (
             <AIChatPage 
               onMessageSent={() => unlockAchievement('deep_conversationalist')} 
               openTerminal={() => setShowTerminal(true)}
             />
          ) : mode === 'LABS' ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-[#0f172a] relative">
               <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden font-mono text-[8px] leading-tight select-none">
                 {Array(100).fill("QUANTUM_FORGE_INITIALIZING_VOID_LOG_ERROR_NEXUS_BREACH_BREACH_DETECTION_").join(" ")}
               </div>
               <div className="text-9xl mb-8 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse">🧪</div>
               <h1 className="text-6xl font-black text-purple-400 mb-4 tracking-tighter italic uppercase">Experimental Labs</h1>
               <p className="text-slate-400 max-w-lg mb-10 text-xs uppercase tracking-[0.3em] font-light">Void protocol 0-X is active. Proceed with extreme caution.</p>
               
               <div className="grid grid-cols-2 gap-6 max-w-xl w-full">
                 <div className="p-6 bg-slate-900 border border-purple-500/30 rounded-2xl hover:bg-slate-800 hover:border-purple-400 transition-all cursor-pointer group shadow-2xl" onClick={() => setGlitchMode(prev => !prev)}>
                   <div className="text-xs font-bold text-purple-400 mb-2 tracking-widest uppercase">Instability Matrix</div>
                   <div className="text-[10px] text-slate-500 uppercase leading-relaxed group-hover:text-slate-300">Trigger visual sensor glitches and reality shifting.</div>
                 </div>
                 <div className="p-6 bg-slate-900 border border-cyan-500/30 rounded-2xl hover:bg-slate-800 hover:border-cyan-400 transition-all cursor-pointer group shadow-2xl" onClick={() => setShowTerminal(true)}>
                   <div className="text-xs font-bold text-cyan-400 mb-2 tracking-widest uppercase">Nexus Shell</div>
                   <div className="text-[10px] text-slate-500 uppercase leading-relaxed group-hover:text-slate-300">Access root level command line interface for advanced tuning.</div>
                 </div>
               </div>
             </div>
          ) : (
             <MainCanvas 
               mode={mode} 
               unlockAchievement={unlockAchievement} 
               onUpdateState={(data) => { getSimDataRef.current = () => data }}
               selectedNodeId={selectedNode?.id || null}
               onSelectNode={setSelectedNode}
               onReceiveMessage={(msg) => setMeshMessages(prev => [...prev, msg])}
               onPeerUpdate={(peer) => console.log('New Peer:', peer.id)}
             />
          )}

          <div className="absolute top-4 right-4 flex gap-2 z-[60]">
            <button 
              onClick={() => setShowAchievements(prev => !prev)}
              className="p-3 bg-[#151e2e]/90 rounded-2xl border border-slate-700 hover:border-yellow-500 transition shadow-2xl group active:scale-90"
              title="View Achievements"
            >
              <span className="group-hover:scale-125 transition-transform inline-block drop-shadow-lg">🏆</span>
            </button>
          </div>
        </main>
      </div>

      {showTerminal && <SecretTerminal onClose={() => setShowTerminal(false)} toggleGlitch={() => setGlitchMode(prev => !prev)} />}
      {showAchievements && <AchievementPanel achievements={achievements} onClose={() => setShowAchievements(false)} />}
    </div>
  );
};

export default App;
