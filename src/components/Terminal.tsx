
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useSimulation } from '../lib/useSimulation';
import { Terminal as TerminalIcon, ShieldAlert, Wifi, Cpu } from 'lucide-react';

export function Terminal() {
  const { lastEvent } = useSimulation();
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastEvent) {
      const time = lastEvent.timestamp;
      let message = "";
      
      switch(lastEvent.status) {
        case 'SUCCESS':
          message = `[${time}] !! INTRUSION DETECTED !! USER: ${lastEvent.username} authenticated from ${lastEvent.ip} (${lastEvent.country})`;
          break;
        case 'BLOCKED':
          message = `[${time}] [SECURITY] IP ${lastEvent.ip} blocked. Reason: Excess threshold. Source: ${lastEvent.country}`;
          break;
        case 'FAILED':
          message = `[${time}] [FAILED] Attempt: ${lastEvent.username} / ${lastEvent.password.replace(/./g, '*')} from ${lastEvent.ip}`;
          break;
      }
      
      setLogs(prev => [...prev, message].slice(-100));
    }
  }, [lastEvent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#060e20] border border-outline-variant/30 rounded-lg overflow-hidden flex flex-col h-full min-h-[350px] shadow-2xl relative group">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Header */}
      <div className="bg-surface-container-high/50 px-4 py-2 border-b border-outline-variant/30 flex justify-between items-center backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error/40 border border-error/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/40 border border-warning/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-secondary/40 border border-secondary/50" />
          </div>
          <TerminalIcon size={14} className="text-primary/70" />
          <span className="font-mono text-[10px] text-primary/70 uppercase tracking-[0.2em] font-bold">SOC_CORE_LOG_STREAM.EXE</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-outline/50 uppercase tracking-widest">
          <div className="flex items-center gap-1">
            <Wifi size={10} className="text-secondary animate-pulse" />
            <span>CONNECTED</span>
          </div>
          <div className="flex items-center gap-1">
            <Cpu size={10} className="text-primary" />
            <span>BUFFER: 94%</span>
          </div>
        </div>
      </div>

      {/* Log Body */}
      <div 
        ref={scrollRef} 
        className="p-4 font-mono text-[11px] overflow-y-auto space-y-1.5 scrollbar-hide flex-1 relative z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0)_0%,rgba(6,14,32,1)_100%)]"
      >
        <div className="opacity-40 mb-4 border-b border-outline-variant/20 pb-2">
          [SYSTEM] Initializing Brute Force Simulation Engine...<br/>
          [SYSTEM] Wordlist loaded: common_passwords_v2.txt<br/>
          [SYSTEM] Proxies initialized: 1,402 active nodes.<br/>
          [SYSTEM] Target: PRODUCTION_AUTH_SERVICE_01
        </div>

        <AnimatePresence initial={false}>
          {logs.map((log, i) => {
            const isCritical = log.includes('!!');
            const isBlocked = log.includes('[SECURITY]');
            const isFailed = log.includes('[FAILED]');

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "border-l-2 pl-3 py-0.5 transition-colors",
                  isCritical ? "text-error border-error bg-error/5 font-bold" : 
                  isBlocked ? "text-orange-400 border-orange-400 bg-orange-400/5" : 
                  isFailed ? "text-primary/60 border-primary/20" : 
                  "text-outline border-transparent"
                )}
              >
                {log}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <div className="flex items-center gap-2 pt-2">
          <span className="text-secondary font-bold tracking-tighter">root@soc_monitor:~$</span>
          <span className="w-2 h-4 bg-secondary/60 animate-[blink_1s_step-end_infinite]" />
        </div>
      </div>

      {/* Decorative scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] scanline z-20" />
    </div>
  );
}
