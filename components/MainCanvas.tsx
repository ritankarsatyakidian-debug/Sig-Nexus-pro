
import React, { useRef, useEffect, useState } from 'react';
import { AppMode, MeshNode, Packet, EnergyComponent, Atom, Bond, Particle, MeshMessage } from '../types';

interface MainCanvasProps {
  mode: AppMode;
  unlockAchievement: (id: string) => void;
  onUpdateState: (data: any) => void;
  selectedNodeId: string | null;
  onSelectNode: (node: MeshNode | null) => void;
  onReceiveMessage: (msg: MeshMessage) => void;
  onPeerUpdate: (peer: MeshNode) => void;
}

const MainCanvas: React.FC<MainCanvasProps> = ({ 
  mode, 
  unlockAchievement, 
  onUpdateState, 
  selectedNodeId, 
  onSelectNode,
  onReceiveMessage,
  onPeerUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [geoStatus, setGeoStatus] = useState("GPS: Initializing...");
  
  const meshNodes = useRef<MeshNode[]>([]);
  const meshPackets = useRef<Packet[]>([]);
  const energyComponents = useRef<EnergyComponent[]>([]);
  const nanoAtoms = useRef<Atom[]>([]);
  const nanoBonds = useRef<Bond[]>([]);
  const nanoParticles = useRef<Particle[]>([]);
  const myPos = useRef({ lat: 0, lon: 0 });
  const myId = useRef('PEER-' + Math.floor(Math.random() * 9000 + 1000));

  const selectedAtom = useRef<Atom | null>(null);
  const hoverAtom = useRef<Atom | null>(null);
  const isStable = useRef(false);

  // Broadcast Channel for P2P Simulation
  const channel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channel.current = new BroadcastChannel('sigmesh_p2p_channel');
    channel.current.onmessage = (ev) => {
      const data = ev.data;
      if (data.senderId === myId.current) return;

      if (data.type === 'HEARTBEAT') {
        const existing = meshNodes.current.find(n => n.id === data.senderId);
        if (!existing) {
          const newNode: MeshNode = {
            id: data.senderId,
            role: 'Remote Peer',
            x: (Math.random() * 0.6 + 0.2) * (canvasRef.current?.width || 800),
            y: (Math.random() * 0.6 + 0.2) * (canvasRef.current?.height || 600),
            radius: 0,
            targetRadius: 18,
            type: 'REAL_PEER',
            lat: data.lat,
            lon: data.lon
          };
          meshNodes.current.push(newNode);
          onPeerUpdate(newNode);
        } else {
          existing.lat = data.lat;
          existing.lon = data.lon;
        }
      } else if (data.type === 'MSG') {
        const sender = meshNodes.current.find(n => n.id === data.senderId);
        const meNode = meshNodes.current.find(n => n.type === 'ME');
        if (sender && meNode && (data.targetId === 'ALL' || data.targetId === myId.current)) {
          meshPackets.current.push({
            id: Math.random().toString(),
            x: sender.x, y: sender.y, tx: meNode.x, ty: meNode.y,
            type: 'MSG', progress: 0, speed: 0.03
          });
          onReceiveMessage({
            senderId: data.senderId,
            targetId: data.targetId,
            text: data.text,
            timestamp: data.timestamp
          });
        }
      } else if (data.type === 'PING') {
        const sender = meshNodes.current.find(n => n.id === data.senderId);
        const meNode = meshNodes.current.find(n => n.type === 'ME');
        if (sender && meNode) {
          meshPackets.current.push({
            id: Math.random().toString(),
            x: sender.x, y: sender.y, tx: meNode.x, ty: meNode.y,
            type: 'PING', progress: 0, speed: 0.05
          });
        }
      }
    };

    // Presence broadcast
    const hbInterval = setInterval(() => {
      channel.current?.postMessage({
        type: 'HEARTBEAT',
        senderId: myId.current,
        lat: myPos.current.lat,
        lon: myPos.current.lon
      });
    }, 3000);

    return () => {
      clearInterval(hbInterval);
      channel.current?.close();
    };
  }, []);

  // Expose send function globally (for Sidebar to use)
  useEffect(() => {
    (window as any).sendMeshMessage = (targetId: string, text: string) => {
      const meNode = meshNodes.current.find(n => n.type === 'ME');
      const targetNode = meshNodes.current.find(n => n.id === targetId);
      if (meNode && targetNode) {
        meshPackets.current.push({
          id: Math.random().toString(),
          x: meNode.x, y: meNode.y, tx: targetNode.x, ty: targetNode.y,
          type: 'MSG', progress: 0, speed: 0.03
        });
        channel.current?.postMessage({
          type: 'MSG',
          senderId: myId.current,
          targetId: targetId,
          text: text,
          timestamp: Date.now()
        });
      }
    };
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition((pos) => {
        myPos.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setGeoStatus(`GPS: ${myPos.current.lat.toFixed(4)}, ${myPos.current.lon.toFixed(4)} ONLINE`);
      });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    resize();
    window.addEventListener('resize', resize);

    if (meshNodes.current.length === 0) {
      meshNodes.current.push({
        id: myId.current, role: 'Field Engineer', x: canvas.width / 2, y: canvas.height / 2, 
        radius: 0, targetRadius: 20, type: 'ME', lat: 0, lon: 0
      });
    }

    let frameId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x <= canvas.width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      if (mode === 'MESH') renderMesh(ctx);
      else if (mode === 'ENERGY') renderEnergy(ctx);
      else if (mode === 'NANO') renderNano(ctx);

      if (frameId % 60 === 0) {
        onUpdateState({
          mode,
          mesh: { nodes: meshNodes.current.length, packets: meshPackets.current.length },
          energy: {
            components: energyComponents.current.map(c => ({ subtype: c.subtype, power: c.power })),
            totalLoad: energyComponents.current.reduce((acc, c) => acc + (c.power < 0 ? Math.abs(c.power) : 0), 0),
            totalGen: energyComponents.current.reduce((acc, c) => acc + (c.power > 0 ? c.power : 0), 0)
          },
          nano: { atoms: nanoAtoms.current.length, bonds: nanoBonds.current.length, stable: isStable.current }
        });
      }

      frameId = requestAnimationFrame(draw);
    };

    const renderMesh = (ctx: CanvasRenderingContext2D) => {
      const nodes = meshNodes.current;
      const packets = meshPackets.current;
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < 300) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        const curX = p.x + (p.tx - p.x) * p.progress;
        const curY = p.y + (p.ty - p.y) * p.progress;
        ctx.beginPath(); ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'PING' ? '#3b82f6' : '#10b981';
        ctx.fill();
        if (p.progress >= 1) packets.splice(i, 1);
      }
      nodes.forEach(n => {
        if (n.radius < n.targetRadius) n.radius += 0.5;
        if (selectedNodeId === n.id) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.radius + 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.type === 'ME' ? '#10b981' : (n.type === 'REAL_PEER' ? '#a855f7' : '#3b82f6');
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.id, n.x, n.y + n.radius + 15);
      });
    };

    const renderEnergy = (ctx: CanvasRenderingContext2D) => {
      const comps = energyComponents.current;
      if (comps.length > 1) {
        const centerX = comps.reduce((acc, c) => acc + c.x, 0) / comps.length;
        const centerY = comps.reduce((acc, c) => acc + c.y, 0) / comps.length;
        ctx.beginPath(); ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        comps.forEach(c => { ctx.moveTo(c.x, c.y); ctx.lineTo(centerX, centerY); });
        ctx.stroke();
      }
      comps.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, c.x, c.y + 3);
      });
    };

    const renderNano = (ctx: CanvasRenderingContext2D) => {
      nanoParticles.current.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.01;
        ctx.fillStyle = `rgba(168, 85, 247, ${p.life})`;
        ctx.fillRect(p.x, p.y, 2, 2);
        if (p.life <= 0) nanoParticles.current.splice(i, 1);
      });
      nanoBonds.current.forEach(b => {
        ctx.strokeStyle = isStable.current ? '#a855f7' : '#475569';
        ctx.lineWidth = isStable.current ? 6 : 3;
        ctx.beginPath(); ctx.moveTo(b.a.x, b.a.y); ctx.lineTo(b.b.x, b.b.y); ctx.stroke();
      });
      if (selectedAtom.current && hoverAtom.current && selectedAtom.current !== hoverAtom.current) {
        ctx.beginPath(); ctx.strokeStyle = 'white'; ctx.setLineDash([5, 5]);
        ctx.moveTo(selectedAtom.current.x, selectedAtom.current.y);
        ctx.lineTo(hoverAtom.current.x, hoverAtom.current.y);
        ctx.stroke(); ctx.setLineDash([]);
      }
      nanoAtoms.current.forEach(a => {
        const isHovered = hoverAtom.current === a;
        const grad = ctx.createRadialGradient(a.x - 5, a.y - 5, 2, a.x, a.y, a.radius + (isHovered ? 5 : 0));
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, a.color);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.radius + (isHovered ? 2 : 0), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(a.element, a.x, a.y + 4);
      });
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [mode, selectedNodeId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'NANO') {
      const target = nanoAtoms.current.find(a => Math.hypot(x - a.x, y - a.y) < a.radius + 10);
      if (target) selectedAtom.current = target;
    } else if (mode === 'MESH') {
      const target = meshNodes.current.find(n => Math.hypot(x - n.x, y - n.y) < n.radius + 10);
      onSelectNode(target || null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'NANO') {
      hoverAtom.current = nanoAtoms.current.find(a => Math.hypot(x - a.x, y - a.y) < a.radius + 10) || null;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mode === 'NANO' && selectedAtom.current && hoverAtom.current && selectedAtom.current !== hoverAtom.current) {
      const alreadyExists = nanoBonds.current.find(b => 
        (b.a === selectedAtom.current && b.b === hoverAtom.current) || 
        (b.b === selectedAtom.current && b.a === hoverAtom.current)
      );
      if (!alreadyExists) {
        nanoBonds.current.push({ a: selectedAtom.current, b: hoverAtom.current });
        if (nanoBonds.current.length >= 3) {
          isStable.current = true;
          unlockAchievement('quantum_alloy');
        }
      }
    }
    selectedAtom.current = null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const subtype = e.dataTransfer.getData('subtype');
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'ENERGY') {
      const specs: Record<string, any> = {
        solar: { w: 50, h: 50, color: '#f59e0b', power: 150, cost: 200, label: 'PV' },
        wind: { w: 60, h: 60, color: '#0ea5e9', power: 600, cost: 800, label: 'WT' },
        battery: { w: 40, h: 70, color: '#10b981', power: 0, cost: 500, label: 'BAT' },
        home: { w: 80, h: 60, color: '#64748b', power: -2000, cost: 0, label: 'LOAD' },
        diesel: { w: 60, h: 50, color: '#78350f', power: 5000, cost: 1500, label: 'DSL' }
      };
      if (specs[subtype]) energyComponents.current.push({ ...specs[subtype], x, y, subtype });
    } else if (mode === 'NANO') {
      const colors: Record<string, string> = { C: '#a8a29e', Si: '#38bdf8', Au: '#facc15', H: '#fff', O: '#f43f5e', N: '#818cf8' };
      nanoAtoms.current.push({ element: subtype, x, y, color: colors[subtype] || '#fff', radius: 15 });
    } else if (mode === 'MESH') {
      meshNodes.current.push({
        id: 'AI-' + Math.floor(Math.random() * 9000),
        role: 'Simulation Node', x, y, radius: 0, targetRadius: 15, type: 'AI_SIM', lat: 0, lon: 0
      });
    }
  };

  return (
    <div 
      className="w-full h-full relative" 
      onDragOver={e => e.preventDefault()} 
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} className="block cursor-crosshair" />
      <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded border border-white/10 text-[10px] text-blue-400 font-mono pointer-events-none z-10">
        {geoStatus}
      </div>
      {mode === 'NANO' && (
        <div className="absolute bottom-4 left-4 bg-black/40 text-[9px] text-slate-400 p-2 rounded pointer-events-none uppercase tracking-widest border border-white/5">
          Drag from atom to atom to form molecular bonds
        </div>
      )}
    </div>
  );
};

export default MainCanvas;
