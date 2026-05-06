
import { ShieldCheck, Cpu, Database, Bell, Settings, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function TopBar() {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/30 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShieldCheck size={28} className="text-primary" />
            <motion.div 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full shadow-[0_0_10px_#4edea3]"
            />
          </div>
          <div>
            <h1 className="font-mono text-lg font-black tracking-tighter text-on-surface uppercase leading-none">VenteTicket <span className="text-primary italic">SOC</span></h1>
            <span className="font-mono text-[8px] text-outline uppercase tracking-[0.4em] leading-none">Cyber Defense Protocol</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 px-6 border-l border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-outline" />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-outline uppercase">CPU Cluster</span>
              <span className="font-mono text-[10px] text-on-surface font-bold">CORE_01: 24%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Database size={14} className="text-outline" />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-outline uppercase">Memory Stack</span>
              <span className="font-mono text-[10px] text-on-surface font-bold">12.4 GB / 32 GB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden md:flex items-center bg-surface-container-lowest/50 border border-outline-variant/30 rounded-md px-3 py-1.5 gap-3">
          <Search size={14} className="text-outline" />
          <input 
            type="text" 
            placeholder="Global Search..." 
            className="bg-transparent border-none outline-none font-mono text-[10px] uppercase tracking-widest text-on-surface w-40 placeholder:text-outline/40"
          />
          <span className="font-mono text-[9px] text-outline/40 border border-outline/20 px-1 rounded">⌘K</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">System Time</span>
            <span className="font-mono text-[11px] text-on-surface tabular-nums">{currentTime}</span>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/30" />
          <button className="relative p-2 text-outline hover:text-primary transition-colors group">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full" />
          </button>
          <button className="p-2 text-outline hover:text-primary transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
