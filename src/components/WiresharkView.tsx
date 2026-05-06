import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Activity, Network, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WiresharkView() {
  const [packets, setPackets] = useState<any[]>([]);
  const [filter, setFilter] = useState('http || tcp');

  useEffect(() => {
    fetchPackets();
    const interval = setInterval(fetchPackets, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPackets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/packets');
      const data = await res.json();
      setPackets(data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="cyber-panel p-4 bg-cyber-dark/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-cyber-black px-3 py-2 rounded border border-white/5 flex-1 max-w-2xl">
          <Filter size={14} className="text-primary" />
          <input 
            type="text" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-mono text-primary w-full"
            placeholder="Display Filter (e.g. ip.addr == 192.168.1.5)"
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 transition-colors">
             <Search size={16} className="text-primary" />
           </button>
           <button className="p-2 bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 transition-colors">
             <Download size={16} className="text-primary" />
           </button>
        </div>
      </div>

      <div className="cyber-panel overflow-hidden">
        <div className="bg-white/5 border-b border-white/5 grid grid-cols-12 gap-2 p-2 text-[10px] font-bold text-primary uppercase tracking-widest">
          <div className="col-span-1 text-center">No.</div>
          <div className="col-span-1">Time</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-2">Destination</div>
          <div className="col-span-1">Protocol</div>
          <div className="col-span-1">Length</div>
          <div className="col-span-4">Info</div>
        </div>
        <div className="h-[500px] overflow-y-auto terminal-scroll font-mono text-[10px]">
          {packets.map((p, i) => (
            <div 
              key={i} 
              className={`grid grid-cols-12 gap-2 p-2 border-b border-white/5 hover:bg-primary/10 cursor-pointer transition-colors ${
                p.protocol === 'HTTP' ? 'bg-cyber-blue/5' : 
                p.protocol === 'TCP' ? 'bg-cyber-purple/5' : ''
              }`}
            >
              <div className="col-span-1 text-center text-on-surface/40">{p.no}</div>
              <div className="col-span-1 text-cyber-green">{p.time}</div>
              <div className="col-span-2">{p.source}</div>
              <div className="col-span-2">{p.destination}</div>
              <div className="col-span-1 font-bold text-primary">{p.protocol}</div>
              <div className="col-span-1 text-on-surface/60">{p.length}</div>
              <div className="col-span-4 truncate text-on-surface/80">{p.info}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="cyber-panel p-5 col-span-2">
           <div className="flex items-center gap-2 text-xs font-display text-primary mb-4 uppercase">
             <Activity size={14} />
             Packet Details (Hex Dump View)
           </div>
          <div className="bg-cyber-black p-4 rounded text-[10px] font-mono leading-tight text-on-surface/60 whitespace-pre">
{`0000  00 0c 29 b8 4a 12 00 0c  29 55 a1 d2 08 00 45 00   ..).J... )U....E.
0010  00 3c 1d 5d 40 00 40 06  b1 2d c0 a8 01 0a c0 a8   .<.]@.@. .-......
0020  01 05 d4 e1 00 50 2a 3a  8e d1 00 00 00 00 a0 02   .....P*: ........
0030  72 10 d6 bc 00 00 02 04  05 b4 04 02 08 0a 00 05   r....... ........
0040  f1 a1 00 00 00 00 01 03  03 07                     ........ ..`}
          </div>
        </div>
        <div className="cyber-panel p-5">
          <div className="flex items-center gap-2 text-xs font-display text-primary mb-4 uppercase">
             <ShieldCheck size={14} />
             Security Analysis
           </div>
           <div className="space-y-4">
              <div className="p-3 bg-cyber-red/10 border border-cyber-red/30 rounded">
                <div className="text-[10px] font-bold text-cyber-red uppercase mb-1">Alert: TCP Flood</div>
                <div className="text-[9px] text-on-surface/60 font-mono">Excessive SYN packets detected from 192.168.1.15</div>
              </div>
              <div className="p-3 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded">
                <div className="text-[10px] font-bold text-cyber-yellow uppercase mb-1">HTTP Method Analysis</div>
                <div className="text-[9px] text-on-surface/60 font-mono">High frequency of POST /api/login requests identified.</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
