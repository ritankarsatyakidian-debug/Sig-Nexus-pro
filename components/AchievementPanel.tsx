
import React from 'react';
import { Achievement } from '../types';

interface Props {
  achievements: Achievement[];
  onClose: () => void;
}

const AchievementPanel: React.FC<Props> = ({ achievements, onClose }) => {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#151e2e] border border-slate-700 rounded-xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Forge Achievements</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        <div className="space-y-3">
          {achievements.map(a => (
            <div key={a.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${a.unlocked ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50 grayscale'}`}>
              <span className="text-3xl">{a.unlocked ? a.icon : '❓'}</span>
              <div>
                <div className="text-sm font-bold">{a.title}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{a.unlocked ? 'Achievement Unlocked' : 'Classified Objective'}</div>
              </div>
              {a.unlocked && <span className="ml-auto text-green-400">✓</span>}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-widest">
           Keep exploring the nexus to unlock more secret protocols
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;
