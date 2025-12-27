
import React from 'react';
import { Achievement } from '../types';

interface Props {
  achievements: Achievement[];
  onClose: () => void;
}

const AchievementPanel: React.FC<Props> = ({ achievements, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[220px] bg-[#0b1120] border border-slate-700 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Nexus Medals</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="space-y-1.5 max-h-[250px] overflow-y-auto no-scrollbar">
          {achievements.map(a => (
            <div key={a.id} className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${a.unlocked ? 'bg-green-900/10 border-green-500/20' : 'bg-slate-800/40 border-slate-700 opacity-20 grayscale'}`}>
              <span className="text-base">{a.unlocked ? a.icon : '🔒'}</span>
              <div className="text-[7px] font-bold text-slate-200 uppercase truncate leading-tight">
                {a.title}
                <div className="text-[5px] text-slate-500 font-normal uppercase">Verified_Status</div>
              </div>
              {a.unlocked && <span className="ml-auto text-green-500 text-[8px]">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;
