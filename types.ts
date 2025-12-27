
export type AppMode = 'MESH' | 'ENERGY' | 'NANO' | 'AI_CHAT' | 'LABS';

export interface GlobalModifiers {
  gravityFailure: boolean;
  overclockMode: boolean;
  ritankarManifesto: boolean;
  satyakiGame: boolean;
  saanviLibrary: boolean;
  digitalPet: boolean;
  saanviQuestProgress: number; 
}

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
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  type: 'PING' | 'MSG';
  progress: number;
  speed: number;
  payload?: any;
}

export interface MeshMessage {
  id: string;
  senderId: string;
  targetId: string;
  text: string;
  timestamp: number;
  isEncrypted: boolean;
  status: 'SENDING' | 'DELIVERED' | 'DECRYPTING';
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
  isDragging?: boolean;
}

export interface Atom {
  id: string;
  element: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  charge: number;
  isDragging?: boolean;
}

export interface Bond {
  id: string;
  aId: string;
  bId: string;
  strength: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

export interface AICharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  accent: string;
}
