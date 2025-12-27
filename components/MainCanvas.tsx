
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { AppMode, MeshNode, Packet, EnergyComponent, Atom, Bond, GlobalModifiers } from '../types';

interface MainCanvasProps {
  mode: AppMode;
  modifiers: GlobalModifiers;
  setModifiers: React.Dispatch<React.SetStateAction<GlobalModifiers>>;
  unlockAchievement: (id: string) => void;
  onUpdateState: (data: any) => void;
  selectedNodeId: string | null;
  onSelectNode: (node: MeshNode | null) => void;
  onReceiveMessage: (packet: any) => void;
  onTriggerSatyaki: () => void;
}

const GRID_SIZE = 40;
const ENERGY_BOND_DIST = 160;

const MainCanvas = forwardRef<{ addPacket: (p: any) => void }, MainCanvasProps>(({ 
  mode, 
  modifiers,
  setModifiers,
  unlockAchievement, 
  onUpdateState, 
  selectedNodeId, 
  onSelectNode,
  onReceiveMessage,
  onTriggerSatyaki
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meshNodes = useRef<MeshNode[]>([]);
  const meshPackets = useRef<Packet[]>([]);
  const energyComponents = useRef<EnergyComponent[]>([]);
  const nanoAtoms = useRef<Atom[]>([]);
  const nanoBonds = useRef<Bond[]>([]);
  
  const draggingItem = useRef<{ id: string, type: 'ATOM' | 'ENERGY' | 'MESH' } | null>(null);
  const bondSource = useRef<string | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    addPacket: (data: any) => {
      const source = meshNodes.current.find(n => n.id === data.senderId);
      const target = meshNodes.current.find(n => n.id === data.targetId);
      if (source && target) {
        meshPackets.current.push({
          id: data.id, 
          sx: source.x, sy: source.y, 
          tx: target.x, ty: target.y,
          type: data.type, 
          progress: 0, 
          speed: 0.02, 
          payload: data.payload
        });
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (meshNodes.current.length === 0) {
      // Forge Initial Nodes
      meshNodes.current.push({
        id: 'ARCHITECT-01', role: 'Forge Prime', x: canvas.width / 2, y: canvas.height / 3, 
        radius: 0, targetRadius: 20, type: 'ME', lat: 0, lon: 0
      });
      for(let i=1; i<=5; i++) {
        meshNodes.current.push({
          id: `SIM-PEER-${i}`, role: 'Neural Simulator', 
          x: Math.random() * canvas.width, y: Math.random() * (canvas.height * 0.7), 
          radius: 0, targetRadius: 15, type: 'AI_SIM', lat: 0, lon: 0
        });
      }
      
      // Feature: User Joins Mesh node creation
      setTimeout(() => {
        meshNodes.current.push({
          id: 'NEW-USER-JOIN', role: 'Remote Guest', 
          x: Math.random() * canvas.width, y: Math.random() * canvas.height, 
          radius: 0, targetRadius: 18, type: 'REAL_PEER', lat: 0, lon: 0
        });
        unlockAchievement('first_ping');
      }, 3000);
    }

    let frameId: number;
    const draw = () => {
      const speedFactor = modifiers.overclockMode ? 5 : 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (modifiers.gravityFailure) {
        ctx.fillStyle = '#050a18';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        for(let i=0; i<60; i++) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6})`;
          ctx.beginPath(); ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI*2); ctx.fill();
        }
        meshNodes.current.forEach(n => { n.y -= 0.8 * speedFactor; if(n.y < -30) n.y = canvas.height + 30; });
        energyComponents.current.forEach(c => { c.y -= 0.6 * speedFactor; if(c.y < -30) c.y = canvas.height + 30; });
        nanoAtoms.current.forEach(a => { a.y -= 0.9 * speedFactor; if(a.y < -30) a.y = canvas.height + 30; });
      }

      if (mode === 'MESH') renderMesh(ctx, speedFactor);
      else if (mode === 'ENERGY') renderEnergy(ctx, speedFactor);
      else if (mode === 'NANO') renderNano(ctx, speedFactor);

      onUpdateState({ mode, meshNodes: meshNodes.current, energy: energyComponents.current, atoms: nanoAtoms.current, bonds: nanoBonds.current });
      frameId = requestAnimationFrame(draw);
    };

    const renderMesh = (ctx: CanvasRenderingContext2D, speed: number) => {
      meshNodes.current.forEach((n, i) => {
        meshNodes.current.slice(i+1).forEach(m => {
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < 400) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0, 1 - d/400) * 0.15})`;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        });
        
        const nodeColor = n.type === 'ME' ? '#06b6d4' : (n.type === 'REAL_PEER' ? '#fbbf24' : '#3b82f6');
        ctx.fillStyle = nodeColor;
        ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, Math.PI * 2); ctx.fill();
        
        if (selectedNodeId === n.id) { 
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n.x, n.y, 14, 0, Math.PI*2); ctx.stroke(); 
        }
        
        ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
        ctx.fillText(n.id, n.x, n.y + 24);
      });

      meshPackets.current = meshPackets.current.filter(p => {
        p.progress += p.speed * speed;
        const x = p.sx + (p.tx - p.sx) * p.progress;
        const y = p.sy + (p.ty - p.sy) * p.progress;
        ctx.fillStyle = p.type === 'PING' ? '#3b82f6' : '#ec4899';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
        if (p.progress >= 1) { onReceiveMessage(p); return false; }
        return true;
      });
    };

    const renderEnergy = (ctx: CanvasRenderingContext2D, speed: number) => {
      // Automatic Bonding Logic: Connect nearby components visually
      energyComponents.current.forEach((c, i) => {
        energyComponents.current.slice(i+1).forEach(c2 => {
          const d = Math.hypot(c.x - c2.x, c.y - c2.y);
          if (d < ENERGY_BOND_DIST) {
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c2.x, c2.y); ctx.stroke();
            ctx.setLineDash([]);
          }
        });

        const dx = c.isDragging ? mousePos.current.x - c.w/2 : c.x - c.w/2;
        const dy = c.isDragging ? mousePos.current.y - c.h/2 : c.y - c.h/2;
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.roundRect(dx, dy, c.w, c.h, 6); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(dx, dy, c.w, 4);
        ctx.fillStyle = 'white'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(c.label, (c.isDragging ? mousePos.current.x : c.x), (c.isDragging ? mousePos.current.y : c.y) + 3);
      });
    };

    const renderNano = (ctx: CanvasRenderingContext2D, speed: number) => {
      nanoBonds.current.forEach(b => {
        const a = nanoAtoms.current.find(at => at.id === b.aId);
        const bt = nanoAtoms.current.find(at => at.id === b.bId);
        if (a && bt) {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; ctx.lineWidth = 3;
          ctx.beginPath(); 
          ctx.moveTo(a.isDragging ? mousePos.current.x : a.x, a.isDragging ? mousePos.current.y : a.y);
          ctx.lineTo(bt.isDragging ? mousePos.current.x : bt.x, bt.isDragging ? mousePos.current.y : bt.y);
          ctx.stroke();
        }
      });
      nanoAtoms.current.forEach(a => {
        const dx = a.isDragging ? mousePos.current.x : a.x;
        const dy = a.isDragging ? mousePos.current.y : a.y;
        if (bondSource.current === a.id) {
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
          ctx.beginPath(); ctx.arc(dx, dy, a.radius + 4, 0, Math.PI*2); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = a.color;
        ctx.beginPath(); ctx.arc(dx, dy, a.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = a.color === '#fff' ? 'black' : 'white'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(a.element, dx, dy + 3);
      });
    };

    draw();
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('resize', resize); };
  }, [mode, modifiers, selectedNodeId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'NANO') {
      const atom = nanoAtoms.current.find(a => Math.hypot(x - a.x, y - a.y) < a.radius + 10);
      if (atom) {
        if (bondSource.current && bondSource.current !== atom.id) {
          nanoBonds.current.push({ id: Math.random().toString(), aId: bondSource.current, bId: atom.id, strength: 1 });
          bondSource.current = null;
        } else {
          bondSource.current = atom.id;
          draggingItem.current = { id: atom.id, type: 'ATOM' }; 
          atom.isDragging = true; 
        }
      } else { bondSource.current = null; }
    } else if (mode === 'ENERGY') {
      const comp = energyComponents.current.find(c => Math.abs(x - c.x) < c.w/2 && Math.abs(y - c.y) < c.h/2);
      if (comp) { draggingItem.current = { id: comp.id, type: 'ENERGY' }; comp.isDragging = true; }
    } else if (mode === 'MESH') {
      const node = meshNodes.current.find(n => Math.hypot(x - n.x, y - n.y) < 25);
      if (node) {
        draggingItem.current = { id: node.id, type: 'MESH' };
        onSelectNode(node);
      } else {
        onSelectNode(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    if (draggingItem.current && draggingItem.current.type === 'MESH') {
      const node = meshNodes.current.find(n => n.id === draggingItem.current!.id);
      if (node) { node.x = mousePos.current.x; node.y = mousePos.current.y; }
    }
  };

  const handleMouseUp = () => {
    if (draggingItem.current) {
      const snapX = Math.round(mousePos.current.x / GRID_SIZE) * GRID_SIZE;
      const snapY = Math.round(mousePos.current.y / GRID_SIZE) * GRID_SIZE;
      
      if (draggingItem.current.type === 'ATOM') {
        const atom = nanoAtoms.current.find(a => a.id === draggingItem.current!.id);
        if (atom) { atom.x = snapX; atom.y = snapY; atom.isDragging = false; }
      } else if (draggingItem.current.type === 'ENERGY') {
        const comp = energyComponents.current.find(c => c.id === draggingItem.current!.id);
        if (comp) { comp.x = snapX; comp.y = snapY; comp.isDragging = false; }
      }
      draggingItem.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const subtype = e.dataTransfer.getData('subtype');
    const type = e.dataTransfer.getData('type');
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.round((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;

    if (mode === 'ENERGY' && type === 'ENERGY') {
      const specs: any = {
        solar: { w: 32, h: 32, color: '#f59e0b', label: 'SOLAR' },
        nuclear: { w: 48, h: 48, color: '#dc2626', label: 'CORE' },
        hydro: { w: 40, h: 32, color: '#2563eb', label: 'HYDRO' },
        fusion: { w: 64, h: 64, color: '#9333ea', label: 'FUS' },
        battery: { w: 40, h: 24, color: '#10b981', label: 'BATT' },
        transfm: { w: 36, h: 36, color: '#4b5563', label: 'XFRM' },
        load: { w: 30, h: 30, color: '#ef4444', label: 'LOAD' },
        wind: { w: 32, h: 48, color: '#38bdf8', label: 'WIND' },
        capacitor: { w: 24, h: 24, color: '#ec4899', label: 'CAP' }
      };
      if (specs[subtype]) energyComponents.current.push({ ...specs[subtype], id: Math.random().toString(), x, y, subtype, health: 100 });
    } else if (mode === 'NANO' && type === 'NANO') {
      const colors: any = { H: '#fff', C: '#444', O: '#f00', N: '#33f', Si: '#aaa', Fe: '#888', Au: '#fd0', U: '#0f0' };
      nanoAtoms.current.push({ id: Math.random().toString(), element: subtype, x, y, color: colors[subtype] || '#888', radius: 12, charge: 0 });
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden" 
         onDragOver={e => e.preventDefault()} onDrop={handleDrop}
         onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
});

export default MainCanvas;
