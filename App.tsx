
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.tsx';
import Sidebar from './components/Sidebar.tsx';
import MainCanvas from './components/MainCanvas.tsx';
import AIChatPage from './components/AIChatPage.tsx';
import SecretTerminal from './components/SecretTerminal.tsx';
import AchievementPanel from './components/AchievementPanel.tsx';
import MainMenu from './components/MainMenu.tsx';
import { AppMode, Achievement, MeshNode, MeshMessage, GlobalModifiers } from './types.ts';
import { INITIAL_ACHIEVEMENTS } from './constants.ts';

const generateUID = () => Math.random().toString(36).substring(2, 11).toUpperCase();

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [mode, setMode] = useState<AppMode>('MESH');
  const [glitchMode, setGlitchMode] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [arsenalHeight, setArsenalHeight] = useState(180);
  const [isArsenalOpen, setIsArsenalOpen] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [isLabsUnlocked, setIsLabsUnlocked] = useState(false);
  
  const [modifiers, setModifiers] = useState<GlobalModifiers>({
    gravityFailure: false,
    overclockMode: false,
    ritankarManifesto: false,
    satyakiGame: false,
    saanviLibrary: false,
    digitalPet: false,
    saanviQuestProgress: 0
  });

  const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);
  const [allMeshMessages, setAllMeshMessages] = useState<MeshMessage[]>([]);
  
  const getSimDataRef = useRef<() => any>(() => ({}));
  const canvasHandleRef = useRef<{ addPacket: (p: any) => void } | null>(null);

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      const target = prev.find(a => a.id === id);
      if (target?.unlocked) return prev;
      return prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
    });
  };

  const handleCommandResult = (cmd: string) => {
    const c = cmd.toLowerCase().trim();
    if (c === 'bel-iq-z' || c === 'moonwalk') {
      setModifiers(m => ({ ...m, gravityFailure: true }));
      setTimeout(() => setModifiers(m => ({ ...m, gravityFailure: false })), 15000);
    } else if (c === 'taiq' || c === 'overclock') {
      setModifiers(m => ({ ...m, overclockMode: true }));
      setTimeout(() => setModifiers(m => ({ ...m, overclockMode: false })), 60000);
      unlockAchievement('glitch_hunter');
    } else if (c === 'spiderstrange' || c === 'powerlingx' || c === 'ritankar') {
      setModifiers(m => ({ ...m, ritankarManifesto: true }));
    } else if (c === 'saanvi' || c === 'library') {
      setModifiers(m => ({ ...m, saanviLibrary: true }));
    } else if (c === 'linginfinity' || c === 'labs') {
      setIsLabsUnlocked(true);
      if (c === 'linginfinity') setMode('LABS');
    }
  };

  const handleSendMeshMessage = useCallback((targetId: string, text: string) => {
    if (!selectedNode) return;
    const msgId = generateUID();
    const newMessage: MeshMessage = {
      id: msgId,
      senderId: selectedNode.id,
      targetId,
      text,
      timestamp: Date.now(),
      isEncrypted: true,
      status: 'SENDING'
    };

    setAllMeshMessages(prev => [...prev, newMessage]);

    canvasHandleRef.current?.addPacket({
      id: msgId,
      senderId: selectedNode.id,
      targetId: targetId,
      type: 'MSG',
      payload: text
    });
  }, [selectedNode]);

  const handlePacketArrival = (packet: any) => {
    if (packet.type === 'MSG') {
      setAllMeshMessages(prev => prev.map(m => 
        m.id === packet.id ? { ...m, status: 'DELIVERED' as const } : m
      ));
    }
  };

  const handleArsenalResize = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = arsenalHeight;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      setArsenalHeight(Math.max(60, Math.min(window.innerHeight * 0.7, startHeight + delta)));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  if (!isInitialized) {
    return <MainMenu onStart={() => setIsInitialized(true)} />;
  }

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden bg-[#020617] text-[#e2e8f0] font-sans relative ${modifiers.overclockMode ? 'shake-active' : ''} ${glitchMode ? 'glitch-active' : ''}`}>
      <Header mode={mode} setMode={(m) => setMode(m)} isLabsUnlocked={isLabsUnlocked} />
      
      <div className="flex flex-1 overflow-hidden relative flex-col">
        <main className="flex-1 relative bg-[#0f172a]/30 overflow-hidden">
          <MainCanvas 
            ref={canvasHandleRef}
            mode={mode} 
            modifiers={modifiers}
            setModifiers={setModifiers}
            unlockAchievement={unlockAchievement} 
            onUpdateState={(data) => { getSimDataRef.current = () => data }}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={setSelectedNode}
            onReceiveMessage={handlePacketArrival}
            onTriggerSatyaki={() => setModifiers(m => ({ ...m, satyakiGame: true }))}
          />

          {mode === 'AI_CHAT' && (
            <div className="absolute inset-0 z-[60]">
              <AIChatPage 
                onMessageSent={() => unlockAchievement('deep_conversationalist')} 
                openTerminal={() => setShowTerminal(true)}
                onTriggerSatyaki={() => setModifiers(m => ({ ...m, satyakiGame: true }))}
              />
            </div>
          )}

          {modifiers.ritankarManifesto && (
            <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-300 border-2 border-slate-500 shadow-[4px_4px_0_black] p-1 w-full max-w-[320px] rounded-sm animate-in zoom-in-95">
                <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-[10px] font-bold">
                  <span>SIG-MANIFESTO.TXT</span>
                  <button onClick={() => setModifiers(m => ({ ...m, ritankarManifesto: false }))} className="bg-slate-300 text-black px-1 border border-slate-600">×</button>
                </div>
                <div className="p-4 bg-black text-[#00ff00] font-mono text-[9px] h-[200px] overflow-y-auto no-scrollbar">
                   <p className="mb-4">ARCHITECT: RITANKAR</p>
                   <p className="leading-tight">
                    "Sig-Nexus is not a simulation. It is the framework for a new digital consensus. Those who bridge the mesh command the energy. Reality is modular. Forge everything."
                   </p>
                   <div className="mt-8 text-center text-4xl grayscale brightness-50">🔑</div>
                </div>
              </div>
            </div>
          )}

          {modifiers.saanviLibrary && (
             <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#0b1120] border border-pink-500/50 p-6 w-full max-w-[280px] rounded-2xl animate-in zoom-in-95">
                   <h3 className="text-sm font-black text-pink-400 mb-2 uppercase italic tracking-widest">Saanvi's Library</h3>
                   <p className="text-[10px] text-slate-400 leading-relaxed mb-6">
                      Welcome to the Bridge. Here, connectivity is empathy. Every relay is a hand reached out to a neighbor.
                   </p>
                   <button onClick={() => setModifiers(m => ({ ...m, saanviLibrary: false }))} className="w-full py-2 bg-pink-600 text-white font-bold rounded-lg uppercase text-[10px]">Close</button>
                </div>
             </div>
          )}

          {modifiers.satyakiGame && (
             <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-4">
                <div className="w-full max-w-[280px] aspect-video bg-black border-4 border-red-600 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.4)]">
                   <h2 className="text-lg font-black text-red-600 italic mb-3 uppercase tracking-widest">Interceptor</h2>
                   <div className="text-center space-y-3">
                      <div className="text-4xl animate-bounce">🚀</div>
                      <p className="font-mono text-[8px] text-red-500 uppercase animate-pulse tracking-tighter">Shield Capacity: INF%</p>
                      <button onClick={() => setModifiers(m => ({ ...m, satyakiGame: false }))} className="px-6 py-2 bg-red-600 text-white font-black rounded-lg hover:bg-red-500 transition-all uppercase text-[9px]">Offline</button>
                   </div>
                </div>
             </div>
          )}

          {mode === 'LABS' && (
            <div className="absolute inset-0 z-[60]">
               <LabsPage openTerminal={() => setShowTerminal(true)} toggleGlitch={() => setGlitchMode(v => !v)} />
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2 z-[70]">
            <button onClick={() => setShowAchievements(prev => !prev)} className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700 hover:border-yellow-500 transition shadow-2xl backdrop-blur-md">🏆</button>
          </div>
        </main>

        {mode !== 'AI_CHAT' && mode !== 'LABS' && (
          <div 
            className={`relative bg-[#0b1120] border-t border-slate-800 transition-all duration-300 ${isArsenalOpen ? '' : 'h-[36px]'}`}
            style={{ height: isArsenalOpen ? arsenalHeight : 36 }}
          >
            <div className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize hover:bg-cyan-500/30 z-[110]" onMouseDown={handleArsenalResize} />
            
            <div className="flex flex-col h-full">
              <div className="h-9 flex items-center justify-between px-6 shrink-0 border-b border-slate-800/20 bg-[#0b1120]">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black tracking-[4px] text-slate-500 uppercase">{mode} ARSENAL</span>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                </div>
                <button onClick={() => setIsArsenalOpen(!isArsenalOpen)} className="text-slate-500 hover:text-white transition-all text-xs">
                  {isArsenalOpen ? '▼' : '▲'}
                </button>
              </div>

              {isArsenalOpen && (
                <div className="flex-1 overflow-hidden">
                  <Sidebar 
                    mode={mode} 
                    isOpen={true}
                    onToggle={() => {}} 
                    getSimData={() => getSimDataRef.current()}
                    onAction={(a) => a === 'ping' && unlockAchievement('first_ping')}
                    selectedMeshNode={selectedNode}
                    meshMessages={allMeshMessages.filter(m => m.senderId === selectedNode?.id || m.targetId === selectedNode?.id)}
                    onSendMeshMessage={handleSendMeshMessage} 
                    onCloseMeshChat={() => setSelectedNode(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showTerminal && <SecretTerminal onClose={() => setShowTerminal(false)} onCommandResult={handleCommandResult} toggleGlitch={() => setGlitchMode(v => !v)} />}
      {showAchievements && <AchievementPanel achievements={achievements} onClose={() => setShowAchievements(false)} />}
      
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          20% { transform: translate(-1px, -2px) rotate(-1deg); }
          40% { transform: translate(-3px, 0px) rotate(1deg); }
          60% { transform: translate(3px, 2px) rotate(0deg); }
          100% { transform: translate(0, 0); }
        }
        .shake-active { animation: shake 0.15s infinite; }
      `}</style>
    </div>
  );
};

const LabsPage: React.FC<{ openTerminal: () => void, toggleGlitch: () => void }> = ({ openTerminal, toggleGlitch }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#020617] relative">
    <div className="text-4xl mb-6 animate-pulse text-purple-600">🧪</div>
    <h1 className="text-2xl font-black text-purple-400 mb-6 uppercase tracking-tighter">Dian's Hidden Labs</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm w-full">
      <div onClick={toggleGlitch} className="p-4 bg-slate-900 border border-purple-500/30 rounded-2xl hover:bg-slate-800 transition-all cursor-pointer">
        <div className="text-[9px] font-bold text-purple-400 mb-1 uppercase">Glitch Protocol</div>
        <p className="text-[8px] text-slate-500">Inject visual inversion.</p>
      </div>
      <div onClick={openTerminal} className="p-4 bg-slate-900 border border-cyan-500/30 rounded-2xl hover:bg-slate-800 transition-all cursor-pointer">
        <div className="text-[9px] font-bold text-cyan-400 mb-1 uppercase">Root Access</div>
        <p className="text-[8px] text-slate-500">Execute console commands.</p>
      </div>
    </div>
  </div>
);

export default App;
