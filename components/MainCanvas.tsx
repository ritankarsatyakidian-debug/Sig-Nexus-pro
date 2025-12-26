
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
  const [geoStatus, setGeoStatus] = useState("LOC: Initializing GPS...");
  
  const meshNodes = useRef<MeshNode[]>([]);
  const meshPackets = useRef<Packet[]>([]);
  const energyComponents = useRef<EnergyComponent[]>([]);
  const nanoAtoms = useRef<Atom[]>([]);
  const nanoBonds = useRef<Bond[]>([]);
  const nanoParticles = useRef<Particle[]>([]);
  const myPos = useRef({ lat: 0, lon: 0 });
  const myId = useRef('ARCH-' + Math.floor(Math.random() * 9000 + 1000));

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
            role: 'Remote Architect',
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
        setGeoStatus(`LOC: ${myPos.current.lat.toFixed(6)}, ${myPos.current.lon.toFixed(6)} RELAY_ACTIVE`);
      }, (err) => setGeoStatus("LOC: GPS_PERMISSION_DENIED"), { enableHighAccuracy: true });
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
        id: myId.current, role: 'Forge Architect', x: canvas.width / 2, y: canvas.height / 2, 
        radius: 0, targetRadius: 20, type: 'ME', lat: 0, lon: 0
      });
    }

    let frameId: number;
    let time = 0;
    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Grid Visuals
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.03)';
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

      if (Math.floor(frameId) % 60 === 0) {
        onUpdateState({
          mode,
          mesh: { nodes: meshNodes.current.length, packets: meshPackets.current.length },
          energy: {
            componentsCount: energyComponents.current.length,
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
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
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
        ctx.beginPath(); ctx.arc(curX, curY, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'PING' ? '#06b6d4' : '#10b981';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (p.progress >= 1) packets.splice(i, 1);
      }
      nodes.forEach(n => {
        if (n.radius < n.targetRadius) n.radius += 0.5;
        if (selectedNodeId === n.id) {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        const baseColor = n.type === 'ME' ? '#10b981' : (n.type === 'REAL_PEER' ? '#a855f7' : '#06b6d4');
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, baseColor);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.id, n.x, n.y + n.radius + 15);
      });
    };

    const renderEnergy = (ctx: CanvasRenderingContext2D) => {
      const comps = energyComponents.current;
      if (comps.length > 1) {
        const centerX = comps.reduce((acc, c) => acc + c.x, 0) / comps.length;
        const centerY = comps.reduce((acc, c) => acc + c.y, 0) / comps.length;
        ctx.beginPath(); ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)'; ctx.lineWidth = 2;
        comps.forEach(c => { ctx.moveTo(c.x, c.y); ctx.lineTo(centerX, centerY); });
        ctx.stroke();
        
        // Flow animation
        const flowOffset = (time * 50) % 100;
        comps.forEach(c => {
          const dx = centerX - c.x;
          const dy = centerY - c.y;
          const len = Math.hypot(dx, dy);
          if (len > 0) {
             const dotX = c.x + dx * (flowOffset / 100);
             const dotY = c.y + dy * (flowOffset / 100);
             ctx.beginPath(); ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
             ctx.fillStyle = c.power > 0 ? '#10b981' : '#f43f5e';
             ctx.fill();
          }
        });
      }
      comps.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.roundRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, c.x, c.y + 3);
        
        // Power readout
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '8px monospace';
        ctx.fillText(`${c.power > 0 ? '+' : ''}${c.power}W`, c.x, c.y + c.h / 2 + 12);
      });
    };

    const renderNano = (ctx: CanvasRenderingContext2D) => {
      nanoParticles.current.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.015;
        ctx.fillStyle = p.color || `rgba(168, 85, 247, ${p.life})`;
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
        if (p.life <= 0) nanoParticles.current.splice(i, 1);
      });
      nanoBonds.current.forEach(b => {
        const a = nanoAtoms.current.find(atom => atom.id === b.aId);
        const bAtom = nanoAtoms.current.find(atom => atom.id === b.bId);
        if (a && bAtom) {
          ctx.strokeStyle = isStable.current ? '#a855f7' : 'rgba(71, 85, 105, 0.5)';
          ctx.lineWidth = isStable.current ? 4 : 2;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bAtom.x, bAtom.y); ctx.stroke();
          
          // Electron flow
          const flowPos = (time * 2) % 1;
          const ex = a.x + (bAtom.x - a.x) * flowPos;
          const ey = a.y + (bAtom.y - a.y) * flowPos;
          ctx.beginPath(); ctx.arc(ex, ey, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff'; ctx.fill();
        }
      });
      if (selectedAtom.current && hoverAtom.current && selectedAtom.current !== hoverAtom.current) {
        ctx.beginPath(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.setLineDash([5, 5]);
        ctx.moveTo(selectedAtom.current.x, selectedAtom.current.y);
        ctx.lineTo(hoverAtom.current.x, hoverAtom.current.y);
        ctx.stroke(); ctx.setLineDash([]);
      }
      nanoAtoms.current.forEach(a => {
        const isHovered = hoverAtom.current === a;
        const radius = a.radius + (isHovered ? 4 : 0);
        const grad = ctx.createRadialGradient(a.x - radius/3, a.y - radius/3, 2, a.x, a.y, radius);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(1, a.color);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
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
        (b.aId === selectedAtom.current!.id && b.bId === hoverAtom.current!.id) || 
        (b.bId === selectedAtom.current!.id && b.aId === hoverAtom.current!.id)
      );
      if (!alreadyExists) {
        nanoBonds.current.push({ aId: selectedAtom.current.id, bId: hoverAtom.current.id, strength: 1 });
        if (nanoBonds.current.length >= 3) {
          isStable.current = true;
          unlockAchievement('quantum_alloy');
        }
        // Spawn particles
        for(let i=0; i<10; i++) {
          nanoParticles.current.push({
            x: hoverAtom.current.x, y: hoverAtom.current.y,
            vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4,
            life: 1, color: '#fff'
          });
        }
      }
    }
    selectedAtom.current = null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const subtype = e.dataTransfer.getData('subtype');
    const type = e.dataTransfer.getData('type');
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'ENERGY' && type === 'ENERGY') {
      const specs: Record<string, any> = {
        solar: { w: 50, h: 50, color: '#f59e0b', power: 150, label: 'PV' },
        wind: { w: 60, h: 60, color: '#0ea5e9', power: 600, label: 'WT' },
        hydro: { w: 70, h: 50, color: '#2563eb', power: 1200, label: 'HYDRO' },
        geothermal: { w: 50, h: 60, color: '#ea580c', power: 800, label: 'GEO' },
        nuclear: { w: 60, h: 60, color: '#dc2626', power: 5000, label: 'NUC' },
        fusion: { w: 60, h: 60, color: '#9333ea', power: 15000, label: 'FUS' },
        battery: { w: 40, h: 60, color: '#10b981', power: 0, label: 'BAT' },
        flywheel: { w: 50, h: 50, color: '#64748b', power: 0, label: 'FLY' },
        capacitor: { w: 30, h: 50, color: '#3b82f6', power: 0, label: 'CAP' },
        home: { w: 70, h: 50, color: '#64748b', power: -2000, label: 'RES' },
        industry: { w: 90, h: 70, color: '#9a3412', power: -15000, label: 'IND' },
        data: { w: 80, h: 60, color: '#1e40af', power: -8000, label: 'SRV' },
        station: { w: 40, h: 50, color: '#15803d', power: -500, label: 'EV' }
      };
      if (specs[subtype]) energyComponents.current.push({ ...specs[subtype], id: Math.random().toString(), x, y, subtype, health: 100 });
    } else if (mode === 'NANO' && type === 'NANO') {
      const colors: Record<string, string> = { 
        H: '#ffffff', He: '#ffccff', C: '#444444', N: '#3333ff', O: '#ff3333', 
        Ne: '#ff33ff', Si: '#9999aa', Fe: '#ccaa33', Cu: '#aa5533', Ag: '#cccccc', 
        Au: '#ffdd00', Ti: '#999999', Pt: '#dddddd', U: '#33ff33' 
      };
      const atomId = Math.random().toString();
      nanoAtoms.current.push({ id: atomId, element: subtype, x, y, color: colors[subtype] || '#fff', radius: 15, charge: 0 });
    } else if (mode === 'MESH' && type === 'MESH') {
      const id = subtype.toUpperCase().substring(0, 3) + '-' + Math.floor(Math.random() * 999);
      meshNodes.current.push({
        id, role: subtype === 'firewall' ? 'Secure Node' : 'Bridge Node', 
        x, y, radius: 0, targetRadius: 18, type: 'AI_SIM', lat: 0, lon: 0
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
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 shadow-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest">{geoStatus}</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 shadow-2xl">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Workspace_Coord: {mode}</span>
        </div>
      </div>
      
      {mode === 'NANO' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/60 backdrop-blur px-6 py-2 rounded-full text-[9px] text-slate-400 font-mono uppercase tracking-[0.3em] border border-white/5 pointer-events-none">
          Link atoms to form molecular bridges
        </div>
      )}
    </div>
  );
};

export default MainCanvas;
