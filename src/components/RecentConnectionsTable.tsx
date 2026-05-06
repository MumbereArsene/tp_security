
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../lib/useSimulation';
import { Filter, Download, Search, Globe, ShieldCheck, ShieldAlert, Ban } from 'lucide-react';
import { cn } from '../lib/utils';

export function RecentConnectionsTable() {
  const { events } = useSimulation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(e => 
    e.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.ip.includes(searchTerm) ||
    e.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = "ID,Timestamp,Username,Password,IP,Country,Status,Detection\n";
    const csv = events.map(e => `${e.id},${e.timestamp},${e.username},${e.password},${e.ip},${e.country},${e.status},${e.detection}`).join("\n");
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soc-audit-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="bg-surface-container/30 border border-outline-variant/20 rounded-lg overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
      <div className="px-6 py-4 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-high/20">
        <div className="flex items-center gap-3">
          <Globe size={18} className="text-primary" />
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Global Connection Audit</h3>
            <p className="font-mono text-[10px] text-outline uppercase">Live packet inspection (L7)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={14} />
            <input 
              type="text" 
              placeholder="FILTER LOGS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant/50 rounded-md py-2 pl-9 pr-4 text-[10px] font-mono focus:border-primary outline-none transition-all w-48 uppercase tracking-widest"
            />
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded-md font-mono text-[10px] uppercase text-outline hover:text-primary hover:border-primary transition-all"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="bg-surface-container-lowest/50">
              {['Timestamp', 'Identity', 'Vector', 'Location', 'Status', 'Risk'].map((head) => (
                <th key={head} className="px-6 py-4 font-mono text-outline-variant uppercase tracking-widest text-[10px] border-b border-outline-variant/20">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            <AnimatePresence initial={false}>
              {filteredEvents.map((event) => (
                <motion.tr 
                  key={event.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-primary/5 transition-colors group relative overflow-hidden"
                >
                  <td className="px-6 py-4 text-outline text-[10px]">{event.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface text-[11px] uppercase">{event.username}</span>
                      <span className="text-[9px] text-outline-variant opacity-50 font-mono">PASS: {event.password.substring(0, 3)}***</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-primary text-[10px] font-mono font-bold tracking-tighter">{event.ip}</span>
                  </td>
                  <td className="px-6 py-4 text-outline text-[10px] uppercase">{event.country}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-2 px-2 py-1 rounded border w-fit",
                      event.status === 'SUCCESS' ? "bg-secondary/10 border-secondary/30 text-secondary" :
                      event.status === 'BLOCKED' ? "bg-error/10 border-error/30 text-error" :
                      "bg-surface-container-highest border-outline-variant/30 text-outline"
                    )}>
                      {event.status === 'SUCCESS' ? <ShieldCheck size={10} /> : event.status === 'BLOCKED' ? <Ban size={10} /> : <ShieldAlert size={10} />}
                      <span className="text-[9px] font-bold tracking-widest uppercase">{event.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          event.detection === 'CRITICAL' ? "bg-error w-full shadow-[0_0_8px_#ffb4ab]" :
                          event.detection === 'MEDIUM' ? "bg-orange-400 w-2/3" :
                          "bg-primary w-1/3"
                        )}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {filteredEvents.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-mono text-xs text-outline-variant uppercase tracking-widest animate-pulse">Waiting for incoming data packets...</p>
        </div>
      )}
    </div>
  );
}
