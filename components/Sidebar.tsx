
import React, { useState } from 'react';
import { AppMode, MeshNode, MeshMessage, EnergyCategory } from '../types.ts';
import { analyzeSimulationData } from '../services/geminiService.ts';

interface SidebarProps {
  mode: AppMode;
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
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'TOOLS'>('ITEMS');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const data = getSimData();
    const result = await analyzeSimulationData(mode, data);
    setAnalysis(result);
    setIsAnalyzing(false);
    onAction('analyze');
  };

  const SidebarSection: React.FC<{ title: string, color: string, children: React.ReactNode }> = ({ title, color, children }) => (
    <div className="mb-6">
      <h3 className={`text-[9px] font-black ${color} mb-3 uppercase tracking-[3px]`}>{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const DraggableItem: React.FC<{ type: string, subtype: string, color: string, label: string, icon?: string }> = ({ subtype, color, label, icon }) => (
    <div 
      draggable 
      onDragStart={(e) => {
        e.dataTransfer.setData('subtype', subtype);
        e.dataTransfer.setData('type', mode);
      }}
      className={`p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl cursor-grab active:cursor-grabbing hover:bg-slate-700/50 hover:border-${color}-500/50 transition-all flex items-center justify-between group shadow-lg`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">{icon}</span>}
        <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`w-1 h-4 bg-${color}-500/30 rounded-full group-hover:bg-${color}-500/60`}></div>
    </div>
  );

  const renderMeshControls = () => (
    <>
      <SidebarSection title="Network Discovery" color="blue">
        <button onClick={() => onAction('ping')} className="w-full p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 text-[10px] font-mono text-blue-400 font-bold tracking-widest shadow-xl flex items-center justify-between group">
          <span>BROADCAST_PING</span>
          <span className="opacity-40 group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <button onClick={() => onAction('rebuild')} className="w-full p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 text-[10px] font-mono text-blue-400 font-bold tracking-widest shadow-xl flex items-center justify-between group">
          <span>REMAP_TOPOLOGY</span>
          <span className="opacity-40 group-hover:rotate-180 transition-transform">↺</span>
        </button>
      </SidebarSection>
      <SidebarSection title="Sim Nodes" color="blue">
        <DraggableItem subtype="relay" color="blue" label="High-Gain Relay" icon="📡" />
        <DraggableItem subtype="firewall" color="red" label="Secure Bridge" icon="🛡️" />
      </SidebarSection>
    </>
  );

  const renderEnergyControls = () => (
    <>
      <div className="flex gap-1 mb-6 bg-slate-900/50 p-1 rounded-xl">
        {['ITEMS', 'TOOLS'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-[9px] font-bold tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-slate-800 text-green-400 shadow-inner shadow-green-500/10' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'ITEMS' ? (
        <>
          <SidebarSection title="Power Generation" color="green">
            <DraggableItem subtype="solar" color="yellow" label="PV Panel" icon="☀️" />
            <DraggableItem subtype="wind" color="cyan" label="Turbine" icon="🌬️" />
            <DraggableItem subtype="hydro" color="blue" label="Hydro Dam" icon="🌊" />
            <DraggableItem subtype="geothermal" color="orange" label="Geo Plant" icon="🌋" />
            <DraggableItem subtype="nuclear" color="red" label="Fission Reactor" icon="☢️" />
            <DraggableItem subtype="fusion" color="purple" label="Fusion Cell" icon="⚛️" />
          </SidebarSection>
          <SidebarSection title="Energy Storage" color="emerald">
            <DraggableItem subtype="battery" color="emerald" label="Li-Ion Stack" icon="🔋" />
            <DraggableItem subtype="flywheel" color="slate" label="Flywheel" icon="⚙️" />
            <DraggableItem subtype="capacitor" color="blue" label="Supercap" icon="🔌" />
          </SidebarSection>
          <SidebarSection title="Consumer Load" color="slate">
            <DraggableItem subtype="home" color="slate" label="Residential" icon="🏠" />
            <DraggableItem subtype="industry" color="orange" label="Industrial" icon="🏭" />
            <DraggableItem subtype="data" color="blue" label="Server Farm" icon="🖧" />
            <DraggableItem subtype="station" color="green" label="EV Station" icon="⚡" />
          </SidebarSection>
        </>
      ) : (
        <SidebarSection title="Grid Tools" color="cyan">
          <div className="grid grid-cols-1 gap-3">
             <button onClick={() => onAction('load_balance')} className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-cyan-500 transition text-[10px] font-mono text-cyan-400 flex flex-col items-center">
               <span className="mb-1">⚖️</span> AUTO_BALANCE
             </button>
             <button onClick={() => onAction('stress_test')} className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-red-500 transition text-[10px] font-mono text-red-400 flex flex-col items-center">
               <span className="mb-1">🧨</span> SIMULATE_SURGE
             </button>
          </div>
        </SidebarSection>
      )}
    </>
  );

  const renderNanoControls = () => (
    <>
      <SidebarSection title="Atomic Forge" color="purple">
        <div className="grid grid-cols-2 gap-2">
          {['H', 'He', 'C', 'N', 'O', 'Ne', 'Si', 'Fe', 'Cu', 'Ag', 'Au', 'Ti', 'Pt', 'U'].map(el => (
             <DraggableItem key={el} subtype={el} color="purple" label={el} />
          ))}
        </div>
      </SidebarSection>
      <SidebarSection title="Forge Tools" color="pink">
        <button onClick={() => onAction('clear_atoms')} className="w-full p-4 bg-red-900/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 text-[10px] font-mono text-red-400 font-bold tracking-widest shadow-xl flex items-center justify-between group">
          <span>PURGE_WORKSPACE</span>
          <span className="opacity-40 group-hover:scale-125 transition-transform">🗑️</span>
        </button>
        <button onClick={() => onAction('auto_bond')} className="w-full p-4 bg-purple-900/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 text-[10px] font-mono text-purple-400 font-bold tracking-widest shadow-xl flex items-center justify-between group mt-2">
          <span>OPTIMIZE_BONDS</span>
          <span className="opacity-40 group-hover:rotate-12 transition-transform">🧬</span>
        </button>
      </SidebarSection>
    </>
  );

  return (
    <aside className="w-80 bg-[#0b1120] border-r border-[#1e293b] flex flex-col shadow-2xl overflow-hidden relative z-40">
      <div className="p-8 border-b border-[#1e293b] bg-gradient-to-br from-slate-900 to-transparent">
        <h2 className="text-[10px] font-black tracking-[5px] text-slate-500 mb-2 uppercase">{mode} PROTOCOLS</h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
          <div className="text-[9px] font-mono text-cyan-500/80">KERNEL_READY // ENCRYPTION_HIGH</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {mode === 'MESH' && renderMeshControls()}
        {mode === 'ENERGY' && renderEnergyControls()}
        {mode === 'NANO' && renderNanoControls()}

        <div className="mt-4 pt-6 border-t border-slate-800">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full p-5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl text-xs font-black tracking-[0.2em] hover:from-cyan-600/30 hover:to-blue-600/30 hover:border-cyan-400 transition-all flex items-center justify-center gap-3 group relative overflow-hidden shadow-2xl active:scale-95"
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {isAnalyzing ? (
              <span className="animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                RUNNING NEXUS AUDIT...
              </span>
            ) : (
              <>
                <span className="text-cyan-400 group-hover:scale-125 transition-transform text-lg">✨</span>
                <span className="text-cyan-100">AI SYSTEM ANALYSIS</span>
              </>
            )}
          </button>

          {analysis && (
            <div className="mt-6 p-6 bg-slate-950/80 backdrop-blur border border-cyan-500/20 rounded-2xl text-[10px] leading-relaxed font-mono text-slate-300 whitespace-pre-wrap animate-in fade-in zoom-in-95 duration-300 relative group">
              <div className="flex justify-between items-center mb-4">
                <span className="text-cyan-500 text-[8px] font-black tracking-widest uppercase">Nexus_Report // v1.2</span>
                <button onClick={() => setAnalysis(null)} className="text-slate-600 hover:text-white transition-colors">×</button>
              </div>
              <div className="opacity-90 leading-normal">{analysis}</div>
            </div>
          )}
        </div>
      </div>

      {selectedMeshNode && (
        <div className="absolute inset-0 bg-[#020617] z-50 flex flex-col p-8 animate-in slide-in-from-right duration-500 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black tracking-[4px] text-blue-400 uppercase">Peer Connection</h3>
              <div className="text-[9px] font-mono text-slate-500 mt-1">ID: {selectedMeshNode.id}</div>
            </div>
            <button onClick={onCloseMeshChat} className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-500 hover:text-white transition-all">×</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
            {meshMessages?.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                 <div className="text-4xl mb-4">📡</div>
                 <div className="text-[8px] font-mono uppercase tracking-widest">Awaiting Peer Response</div>
               </div>
            )}
            {meshMessages?.map((m, i) => (
              <div key={i} className={`p-4 rounded-2xl text-[10px] leading-normal animate-in fade-in slide-in-from-bottom-2 duration-300 ${m.senderId === 'ME' ? 'bg-blue-600/10 border border-blue-500/30 ml-8 text-blue-100 rounded-tr-none' : 'bg-slate-900/80 border border-slate-800 mr-8 text-slate-200 rounded-tl-none'}`}>
                <div className="text-[8px] font-black text-slate-500 mb-2 tracking-widest uppercase">{m.senderId === 'ME' ? 'YOU' : m.senderId}</div>
                <div className="font-mono">{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 focus-within:border-blue-500/50 transition-all">
            <input 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  onSendMeshMessage?.(selectedMeshNode.id, chatInput);
                  setChatInput('');
                }
              }}
              placeholder="Send packet..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[11px] font-mono text-slate-200 placeholder:text-slate-600"
            />
          </div>
        </div>
      )}

      <div className="p-6 bg-[#020617] border-t border-[#1e293b] flex items-center justify-between">
        <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
           Auth: Architect // {Math.random().toString(16).substring(2, 6).toUpperCase()}
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-cyan-500"></div>
          <div className="w-1 h-1 rounded-full bg-cyan-500/50"></div>
          <div className="w-1 h-1 rounded-full bg-cyan-500/20"></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
