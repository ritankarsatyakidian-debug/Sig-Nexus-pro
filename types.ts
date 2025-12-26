
export type AppMode = 'MESH' | 'ENERGY' | 'NANO' | 'AI_CHAT' | 'LABS';

export interface MeshNode {
  id: string;
  role: string;
  x: number;
  y: number;
  radius: number;
  targetRadius: number;
  type: 'ME' | 'AI_SIM' | 'REAL_PEER';
  lat: number;
  lon: number;
}

export interface Packet {
  id: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  type: 'PING' | 'MSG';
  progress: number;
  speed: number;
}

export interface MeshMessage {
  senderId: string;
  targetId: string;
  text: string;
  timestamp: number;
}

export type EnergyCategory = 'GENERATION' | 'STORAGE' | 'LOAD' | 'EXPERIMENTAL';

export interface EnergyComponent {
  id: string;
  subtype: string;
  category: EnergyCategory;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  power: number;
  health: number;
  label: string;
}

export interface Atom {
  id: string;
  element: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  charge: number;
}

export interface Bond {
  aId: string;
  bId: string;
  strength: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color?: string;
}

export interface AICharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  accent: string;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}
