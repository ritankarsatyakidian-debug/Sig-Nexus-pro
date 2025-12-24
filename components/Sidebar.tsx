
import React, { useState, useRef, useEffect } from 'react';
import { AppMode, MeshNode, MeshMessage } from '../types';
import { analyzeSimulationData } from '../services/geminiService';

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
  mode, onAction, getSimData, 
  selectedMeshNode, meshMessages = [], onSendMeshMessage, onCloseMeshChat 
}) => {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meshChatInput, setMeshChatInput] = useState('');
  const meshChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    meshChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [meshMessages]);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const realData = getSimData();
    const res = await analyzeSimulationData(mode, realData);
    setAnalysisResult(res);
    setIsAnalyzing(false);
  };

  const handleMeshSend = () => {
    if (!meshChatInput.trim() || !selectedMeshNode || !onSendMeshMessage) return;
    onSendMeshMessage(selectedMeshNode.id, meshChatInput);
    setMeshChatInput('');
  };

  return (
    <aside className="w-80 bg-[#151e2e] border-r border-[#334155] flex flex-col p-6 overflow-y-auto h-full relative z-20">
      {mode === 'MESH' && (
        <div className="h-full flex flex-col">
          {selectedMeshNode ? (
            <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <button onClick={onCloseMeshChat} className="text-[10px] text-blue-400 font-bold hover:underline">← BACK</button>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Secure Channel</div>
              </div>
              <div className="bg-[#0b1120] border border-blue-900/50 p-4 rounded-xl mb-4">
                <div className="text-xs font-bold text-white mb-1 truncate">{selectedMeshNode.id}</div>
                <div className="text-[9px] text-blue-500 uppercase font-mono">{selectedMeshNode.role}</div>
              </div>
              <div className="flex-1 bg-black/40 border border-slate-800 rounded-lg p-3 overflow-y-auto mb-4 font-mono text-[10px] space-y-2 custom-scrollbar min-h-[200px]">
                {meshMessages.length === 0 && <div className="text-slate-700 italic text-center mt-10">Handshake established. Encrypted channel silent.</div>}
                {meshMessages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.senderId === 'ME' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-2 py-1 rounded max-w-[90%] ${m.senderId === 'ME' ? 'bg-blue-600/20 text-blue-100' : 'bg-slate-800 text-slate-300'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={meshChatEndRef} />
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={meshChatInput}
                  onChange={(e) => setMeshChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMeshSend()}
                  placeholder="Type secure message..."
                  className="flex-1 bg-black/50 border border-slate-700 rounded px-2 py-2 text-[10px] focus:outline-none focus:border-blue-500 font-mono"
                />
                <button 
                  onClick={handleMeshSend}
                  className="px-3 bg-blue-600 hover:bg-blue-500 rounded text-[9px] font-bold"
                >
                  SEND
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <SectionHeader title="Real-Time Mesh Layer" />
              <div className="bg-blue-900/20 border border-blue-800 p-3 rounded text-[10px] text-blue-400 leading-relaxed font-mono">
                <strong>STATUS:</strong> BROADCASTING<br/>
                <strong>PROTOCOL:</strong> SIGMESH_v2.1<br/>
                <strong>SECURITY:</strong> AES-256-GCM
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic border-l-2 border-slate-700 pl-3">
                Click on nodes in the workspace to establish point-to-point secure tunnels. Open this app in another tab to see it appear.
              </p>
              <button 
                onClick={() => onAction('ping')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition-all shadow-lg text-xs"
              >
                📡 BROADCAST PING
              </button>
              
              <SectionHeader title="Active Protocols" />
              <div className="grid grid-cols-2 gap-3">
                 <ProtocolItem icon="📶" name="Bluetooth" meta="Mesh L1" />
                 <ProtocolItem icon="📡" name="Direct" meta="P2P L2" />
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'ENERGY' && (
        <div className="space-y-6">
          <SectionHeader title="Generation Units" />
          <div className="grid grid-cols-2 gap-3">
             <PaletteItem icon="☀️" name="Solar" meta="150W" subtype="solar" />
             <PaletteItem icon="🌬️" name="Wind" meta="600W" subtype="wind" />
          </div>
          <SectionHeader title="Storage & Load" />
          <div className="grid grid-cols-2 gap-3">
             <PaletteItem icon="🔋" name="Battery" meta="5kWh" subtype="battery" />
             <PaletteItem icon="🏠" name="House" meta="-2kW" subtype="home" />
             <PaletteItem icon="⚙️" name="Gen" meta="5kW" subtype="diesel" />
          </div>
          <div className="pt-4 space-y-3">
            <button 
              onClick={runAIAnalysis}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded font-bold text-white shadow-lg text-xs hover:brightness-110 transition uppercase tracking-tighter"
            >
              {isAnalyzing ? '⚡ Processing State...' : '⚡ Gemini Grid Diagnostic'}
            </button>
          </div>
        </div>
      )}

      {mode === 'NANO' && (
        <div className="space-y-6">
          <SectionHeader title="Atomic Palette" />
          <div className="grid grid-cols-2 gap-3">
             <PaletteItem icon="⚫" name="Carbon" meta="Core" subtype="C" />
             <PaletteItem icon="⚪" name="Hydrogen" meta="Link" subtype="H" />
             <PaletteItem icon="🔴" name="Oxygen" meta="Oxide" subtype="O" />
             <PaletteItem icon="💠" name="Silicon" meta="Semi" subtype="Si" />
             <PaletteItem icon="💎" name="Gold" meta="Conduct" subtype="Au" />
          </div>
          <div className="pt-4 space-y-3">
            <button 
              onClick={runAIAnalysis}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded font-bold text-white shadow-lg text-xs hover:brightness-110 transition uppercase tracking-tighter"
            >
              {isAnalyzing ? '⚛️ Quantizing...' : '⚛️ Gemini Nano Audit'}
            </button>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="mt-6 p-4 bg-slate-900 border border-slate-700 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 relative shadow-2xl">
          <button 
            onClick={() => setAnalysisResult(null)} 
            className="absolute top-2 right-2 text-slate-500 hover:text-white"
          >
            ×
          </button>
          <div className="text-[10px] font-bold text-blue-400 mb-2 uppercase tracking-widest border-b border-slate-800 pb-1">Nexus Intelligence Report</div>
          <div className="text-[10px] text-slate-300 leading-relaxed overflow-y-auto max-h-[300px] prose prose-invert prose-xs">
            {analysisResult.split('\n').map((line, i) => (
              <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-[9px] font-black text-[#64748b] uppercase tracking-[3px] border-b border-[#334155] pb-2 mb-4">{title}</h3>
);

const PaletteItem: React.FC<{ icon: string, name: string, meta: string, subtype: string }> = ({ icon, name, meta, subtype }) => (
  <div 
    draggable 
    onDragStart={(e) => e.dataTransfer.setData('subtype', subtype)}
    className="bg-[#1e293b] border border-[#334155] p-3 rounded flex flex-col items-center cursor-grab hover:bg-[#334155] hover:border-blue-500/50 hover:-translate-y-1 transition-all active:cursor-grabbing group shadow-sm"
  >
    <span className="text-2xl mb-1 group-hover:scale-110 transition">{icon}</span>
    <span className="text-[10px] font-bold text-white">{name.toUpperCase()}</span>
    <span className="text-[8px] text-[#64748b] font-mono">{meta}</span>
  </div>
);

const ProtocolItem: React.FC<{ icon: string, name: string, meta: string }> = ({ icon, name, meta }) => (
  <div className="bg-[#1e293b]/50 border border-[#334155] p-2 rounded flex flex-col items-center opacity-70 hover:opacity-100 transition">
    <span className="text-xl mb-1">{icon}</span>
    <span className="text-[9px] font-semibold text-white">{name}</span>
    <span className="text-[7px] text-[#64748b] uppercase tracking-tighter">{meta}</span>
  </div>
);

export default Sidebar;
