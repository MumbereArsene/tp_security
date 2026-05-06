import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Activity, 
  Zap, 
  Search, 
  Terminal as TerminalIcon,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();
  
  const currentTab = searchParams.get('tab') || 'monitor';

  const menuItems = [
    { id: 'operations', label: 'Operations', icon: LayoutDashboard, path: '/dashboard', tab: 'monitor' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity, path: '/dashboard', tab: 'monitor' },
    { id: 'simulator', label: 'Attack Simulator', icon: Zap, path: '/dashboard', tab: 'bruteforce' },
    { id: 'packet', label: 'Packet Inspector', icon: Search, path: '/dashboard', tab: 'network' },
    { id: 'hydra', label: 'Hydra Attaque', icon: TerminalIcon, path: '/logs', tab: null },
  ];

  const handleNavigate = (path: string, tab: string | null) => {
    if (tab) {
      navigate(`${path}?tab=${tab}`);
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#050505] border-r border-white/5 flex flex-col z-50 h-screen shadow-2xl">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/40">
            <ShieldAlert size={18} className="text-primary" />
          </div>
          <span className="text-sm font-black text-white uppercase tracking-tighter">CyberSOC <span className="text-primary">Alpha-1</span></span>
        </div>
        <div className="font-mono text-[8px] text-white/30 uppercase tracking-[0.5em] pl-1">Command Center</div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path && (item.tab ? currentTab === item.tab : true);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path, item.tab)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-mono text-[11px] uppercase tracking-wider transition-all relative group",
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(173,198,255,0.05)]" 
                    : "text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-colors",
                  isActive ? "text-primary" : "group-hover:text-primary"
                )} />
                {item.label}
                
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_#adc6ff]"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-8 border-t border-white/5 space-y-6 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="font-mono text-xs font-bold text-primary italic">JP</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-white font-bold uppercase tracking-tight">Operator_01</span>
              <span className="font-mono text-[8px] text-green-500 uppercase tracking-[0.2em] animate-pulse">Online</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-white/20 hover:text-red-400 transition-colors p-2"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
