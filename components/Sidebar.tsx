
import React, { useState } from 'react';
import { AppMode, MeshNode, MeshMessage } from '../types.ts';
import { analyzeSimulationData } from '../services/geminiService.ts';

interface SidebarProps {
  mode: AppMode;
  isOpen: boolean;
  onToggle: () => void;
  onAction: (actionId: string) => void;
  getSimData: () => any;
  selectedMeshNode?: MeshNode | null;
  meshMessages?: MeshMessage[];
  onSendMeshMessage?: (targetId: string, text: string) => void;
  onCloseMeshChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  mode, 
  onAction, 
  getSimData, 
  selectedMeshNode,
  meshMessages,
  onSendMeshMessage,
  onCloseMeshChat
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [msgInput, setMsgInput] = useState('');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const data = getSimData();
    const result = await analyzeSimulationData(mode, data);
    setAnalysis(result);
    setIsAnalyzing(false);
    onAction('analyze');
  };

  const DraggableItem: React.FC<{ subtype: string, color: string, label: string, icon?: string }> = ({ subtype, color, label, icon }) => (
    <div 
      draggable 
      onDragStart={(e) => {
        e.dataTransfer.setData('subtype', subtype);
        e.dataTransfer.setData('type', mode);
      }}
      className="min-w-[100px] h-[70px] p-2 bg-slate-900/60 border border-slate-800 rounded-xl cursor-grab active:cursor-grabbing hover:border-cyan-500/50 hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-1 shadow-md shrink-0"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[8px] font-black text-slate-300 uppercase text-center leading-none">{label}</span>
      <div className="w-4 h-0.5 mt-1 rounded-full" style={{ backgroundColor: color }} />
    </div>
  );

  return (
    <div className="h-full w-full flex overflow-hidden relative">
      {mode === 'MESH' && selectedMeshNode && (
        <div className="absolute inset-0 bg-[#0b1120] z-[120] flex flex-col p-4 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Linked Node: {selectedMeshNode.id}</span>
            <button onClick={onCloseMeshChat} className="text-slate-500 hover:text-white">×</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 mb-2">
            {meshMessages?.map(m => (
              <div key={m.id} className={`flex ${m.senderId === selectedMeshNode.id ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-2 rounded-lg text-[9px] max-w-[80%] ${m.senderId === selectedMeshNode.id ? 'bg-slate-800' : 'bg-cyan-900/20 border border-cyan-800/30'}`}>
                  {m.text}
                  <div className="text-[6px] opacity-40 mt-1 uppercase">{m.status}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              value={msgInput} 
              onChange={e => setMsgInput(e.target.value)} 
              onKeyDown={e => { if(e.key === 'Enter') { onSendMeshMessage?.(selectedMeshNode.id, msgInput); setMsgInput(''); } }}
              placeholder="Inject command..." 
              className="flex-1 bg-black border border-slate-800 rounded-lg px-3 py-1.5 text-[9px] outline-none focus:border-cyan-500"
            />
            <button onClick={() => { onSendMeshMessage?.(selectedMeshNode.id, msgInput); setMsgInput(''); }} className="px-3 bg-cyan-600 rounded-lg text-[9px] font-black uppercase">Send</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-x-auto custom-scrollbar flex items-center p-3 gap-3">
        {mode === 'MESH' && (
          <div className="flex gap-3 items-center h-full">
             <button onClick={() => onAction('ping')} className="min-w-[100px] h-[70px] bg-blue-500/10 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center hover:bg-blue-500/20 transition-all">
               <span className="text-lg">📡</span>
               <span className="text-[8px] font-black text-blue-400 mt-1 uppercase">Ping_Mesh</span>
             </button>
             <DraggableItem subtype="relay" color="#3b82f6" label="Relay" icon="🛰️" />
             <DraggableItem subtype="firewall" color="#ef4444" label="Gateway" icon="🛡️" />
          </div>
        )}
        
        {mode === 'ENERGY' && (
          <div className="flex gap-3 items-center h-full">
            <DraggableItem subtype="solar" color="#f59e0b" label="Solar" icon="☀️" />
            <DraggableItem subtype="nuclear" color="#dc2626" label="Core" icon="☢️" />
            <DraggableItem subtype="hydro" color="#2563eb" label="Hydro" icon="🌊" />
            <DraggableItem subtype="fusion" color="#9333ea" label="Fusion" icon="⚛️" />
            <DraggableItem subtype="battery" color="#10b981" label="Storage" icon="🔋" />
            <DraggableItem subtype="wind" color="#38bdf8" label="Wind" icon="🌪️" />
            <DraggableItem subtype="capacitor" color="#ec4899" label="Capacitor" icon="💊" />
            <DraggableItem subtype="load" color="#ef4444" label="Load" icon="🏭" />
          </div>
        )}

        {mode === 'NANO' && (
          <div className="flex gap-3 items-center h-full">
            {['H', 'C', 'O', 'N', 'Si', 'Fe', 'Au', 'U'].map(el => (
              <div 
                key={el}
                draggable 
                onDragStart={(e) => {
                  e.dataTransfer.setData('subtype', el);
                  e.dataTransfer.setData('type', mode);
                }}
                className="w-12 h-12 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-xs font-black hover:border-purple-500 transition-all cursor-grab shadow-sm shrink-0"
              >
                <span className="text-slate-100 text-[10px]">{el}</span>
              </div>
            ))}
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center pl-3 border-l border-slate-800/50">
          <button onClick={handleAnalyze} disabled={isAnalyzing} className="px-5 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-[8px] font-black tracking-widest text-cyan-400 hover:bg-cyan-500/20 transition-all uppercase">
            {isAnalyzing ? "Scanning..." : "Audit"}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="fixed inset-0 z-[150] bg-[#020617]/95 backdrop-blur-md p-6 flex flex-col animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">Analysis Results</h3>
            <button onClick={() => setAnalysis(null)} className="text-slate-500 hover:text-white text-2xl font-light">×</button>
          </div>
          <div className="flex-1 overflow-y-auto text-[10px] font-mono text-slate-300 leading-relaxed custom-scrollbar max-w-xl mx-auto w-full whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
