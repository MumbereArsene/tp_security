import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Terminal as TerminalIcon } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export function Terminal() {
  const [logs, setLogs] = useState<{line: string, timestamp: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch History from Database
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/terminal/history');
        const data = await res.json();
        setLogs(data);
      } catch (e) {
        console.error("Failed to fetch terminal history", e);
      }
    };
    fetchHistory();

    // 2. Real-time listener
    socket.on('new_terminal_log', (data) => {
      setLogs(prev => [...prev, data].slice(-1000));
    });

    socket.on('dashboard_reset', () => {
      setLogs([]);
    });

    return () => {
      socket.off('new_terminal_log');
      socket.off('dashboard_reset');
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#050505] border border-white/10 rounded-xl overflow-hidden flex flex-col h-full min-h-[500px] shadow-2xl relative">
      <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <TerminalIcon size={14} className="text-white/40" />
          <span className="font-mono text-[11px] text-white/60 tracking-wider font-bold">HYDRA_AUDIT_SESSION_LIVE</span>
        </div>
      </div>

      <div 
        ref={scrollRef} 
        className="p-6 font-mono text-[12px] overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 flex-1 bg-black"
      >
        <AnimatePresence initial={false}>
          {logs.map((log, i) => {
            const isSuccess = log.line.includes('SUCCESS');
            const isError = log.line.includes('ERROR');
            const isHeader = log.line.includes('===') || log.line.includes('---');
            const isStatus = log.line.includes('[!]') || log.line.includes('[*]');

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "whitespace-pre font-mono leading-relaxed",
                  isSuccess ? "text-[#27c93f] font-bold" : 
                  isError ? "text-[#ff5f56]" : 
                  isHeader ? "text-[#00d4ff] opacity-80" :
                  isStatus ? "text-[#ffbd2e]" :
                  "text-[#d1d1d1]"
                )}
              >
                {log.line}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <div className="flex items-center gap-2 pt-2">
          <span className="text-[#27c93f] font-bold">root@soc:~$</span>
          <span className="w-2 h-4 bg-white/40 animate-[blink_1s_step-end_infinite]" />
        </div>
      </div>
      
      <style>{`
        @keyframes blink {
          from, to { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
