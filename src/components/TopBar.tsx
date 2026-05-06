import { Box, Radio } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';

interface TopBarProps {
  attacksPerSecond?: number;
}

export function TopBar({ attacksPerSecond = 0 }: TopBarProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const tab = searchParams.get('tab') || 'monitor';
  const pageName = location.pathname === '/logs' ? 'AUDIT_LOGS' : `SYSTEM_ALPHA / ${tab.toUpperCase()}`;

  return (
    <header className="h-20 border-b border-white/5 bg-cyber-black/20 backdrop-blur-md flex items-center justify-between px-12 z-30">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Box size={16} className="text-primary" />
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Active Node</span>
          <span className="text-xs font-mono text-white uppercase tracking-widest">{pageName}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-white/30 uppercase font-bold mb-1 font-mono">Packet Throughput</span>
          <div className="flex items-center gap-3 text-xs font-bold text-primary">
            <Radio size={14} className="animate-pulse" />
            {(attacksPerSecond * 0.12).toFixed(2)} GB/S
          </div>
        </div>
        <div className="h-10 w-[1px] bg-white/5" />
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-white/30 uppercase font-bold mb-1 font-mono">Encryption Mode</span>
          <div className="text-xs font-bold text-yellow-500 font-mono">AES-256_GCM</div>
        </div>
      </div>
    </header>
  );
}
