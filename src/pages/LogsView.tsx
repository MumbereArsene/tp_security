import { Terminal } from '../components/Terminal';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { motion } from 'framer-motion';
import { ClipboardList, ShieldAlert } from 'lucide-react';

export default function LogsView() {
  return (
    <div className="flex h-screen bg-cyber-black overflow-hidden font-display pl-72">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-12 relative">
          {/* Background decoration */}
          <div className="fixed top-1/4 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-[1600px] mx-auto h-full flex flex-col">
            <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] font-bold">Audit & Investigation</span>
                </div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tight">System <span className="text-primary italic">Audit Logs</span></h1>
              </motion.div>

              <div className="flex items-center gap-6 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest mb-1">Terminal Status</span>
                  <span className="text-xs text-green-400 font-bold font-mono">LIVE_STREAM_ACTIVE</span>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <ShieldAlert className="w-6 h-6 text-green-500 animate-pulse" />
                </div>
              </div>
            </header>

            <div className="flex-1 min-h-0">
              <Terminal />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
