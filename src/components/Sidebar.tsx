
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Terminal, 
  ShieldCheck, 
  Settings, 
  Database, 
  Globe, 
  FileText,
  Activity,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Operations', icon: LayoutDashboard },
    { id: 'logs', label: 'Packet Audit', icon: Database },
    { id: 'threats', label: 'Threat Intel', icon: ShieldCheck },
    { id: 'network', label: 'Network Map', icon: Globe },
    { id: 'analysis', label: 'Deep Analysis', icon: Activity },
    { id: 'reports', label: 'Export Logs', icon: FileText },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container border-r border-outline-variant/20 flex flex-col z-40">
      <div className="p-6">
        <div className="font-mono text-[10px] text-outline uppercase tracking-widest mb-4 opacity-50 font-bold italic">Command & Control</div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-md font-mono text-[11px] uppercase tracking-wider transition-all relative group",
                activeTab === item.id 
                  ? "text-primary bg-primary/10 border-l-2 border-primary" 
                  : "text-outline hover:text-on-surface hover:bg-surface-container-highest/50 border-l-2 border-transparent"
              )}
            >
              <item.icon size={16} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-primary" : "text-outline group-hover:text-primary"
              )} />
              {item.label}
              
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#adc6ff]"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-6">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] text-outline uppercase">Node Latency</span>
            <span className="font-mono text-[9px] text-secondary font-bold">14ms</span>
          </div>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: ['10%', '15%', '12%'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-full bg-secondary"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="font-mono text-[10px] font-bold text-primary">OP</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-on-surface font-bold uppercase">Jerome_P</span>
              <span className="font-mono text-[8px] text-secondary uppercase tracking-widest">Admin_Level_4</span>
            </div>
          </div>
          <button className="text-outline hover:text-error transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
      
      {/* Decorative vertical text */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-90 text-[60px] font-bold opacity-[0.02] pointer-events-none select-none font-mono">
        SYSTEM_ACTIVE
      </div>
    </aside>
  );
}
