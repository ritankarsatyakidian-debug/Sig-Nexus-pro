
import { AICharacter, Achievement } from './types';

export const AI_CHARACTERS: AICharacter[] = [
  {
    id: 'ritankar',
    name: 'Ritankar',
    role: 'Architect AI',
    description: 'Expert in system architecture and high-level structure.',
    avatar: '🏛️',
    accent: 'border-blue-500 text-blue-400'
  },
  {
    id: 'ibhan',
    name: 'Ibhan',
    role: 'Network Strategist',
    description: 'Specialist in SigMesh protocols and peer connectivity.',
    avatar: '📡',
    accent: 'border-cyan-500 text-cyan-400'
  },
  {
    id: 'soumyadeepta',
    name: 'Soumyadeepta',
    role: 'Energy Engineer',
    description: 'Master of microgrid stability and load management.',
    avatar: '⚡',
    accent: 'border-green-500 text-green-400'
  },
  {
    id: 'saanvi',
    name: 'Saanvi',
    role: 'Bridge Explainer',
    description: 'Friendly AI focused on making complex tech easy to understand.',
    avatar: '🌈',
    accent: 'border-pink-500 text-pink-400'
  },
  {
    id: 'satyaki',
    name: 'Satyaki',
    role: 'Defense Specialist',
    description: 'Hardened AI expert in resilience and cyber-defense.',
    avatar: '🛡️',
    accent: 'border-red-500 text-red-400'
  },
  {
    id: 'dian',
    name: 'Dian',
    role: 'Risk Navigator',
    description: 'Experimental AI that thrives on chaos and visual glitches.',
    avatar: '👾',
    accent: 'border-purple-500 text-purple-400'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_ping', title: 'Network Pulse', icon: '📡', unlocked: false },
  { id: 'blackout_survivor', title: 'Grid Resilient', icon: '🔋', unlocked: false },
  { id: 'quantum_alloy', title: 'Nano-Smith', icon: '⚛️', unlocked: false },
  { id: 'glitch_hunter', title: 'System Cracker', icon: '👾', unlocked: false },
  { id: 'deep_conversationalist', title: 'AI Whisperer', icon: '🧠', unlocked: false }
];
