import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, Activity, Database, Globe, Terminal as TerminalIcon, 
  Lock, Unlock, Cpu, Zap, Radio, BarChart3, Network, Target, List, Search,
  ChevronRight, Box, Settings, CheckCircle2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import HydraLab from '../components/HydraLab';
import WiresharkView from '../components/WiresharkView';

const socket = io('http://localhost:5000', {
  transports: ['websocket']
});

interface AttackData {
  id: number;
  timestamp: string;
  username: string;
  password?: string;
  ip: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  detection: string;
}

interface Stats {
  totalAttempts: number;
  successCount: number;
  failedCount: number;
  blockedCount: number;
  ipsBlocked: number;
  alertCount: number;
  attacksPerSecond: number;
  threatLevel: string;
  successRatio?: string;
}

export default function Dashboard() {
  const [attacks, setAttacks] = useState<AttackData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'monitor' | 'bruteforce' | 'network'>('monitor');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'monitor' || tab === 'bruteforce' || tab === 'network') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const initialSync = async () => {
      try {
        const [statsRes, alertsRes, logsRes] = await Promise.all([
          api.get('/stats'),
          api.get('/alerts'),
          api.get('/logs')
        ]);
        setStats(statsRes.data);
        setAlerts(alertsRes.data);
        setAttacks(logsRes.data);
      } catch (e) { console.error(e); }
    };
    initialSync();

    socket.on('new_attack', (data: AttackData) => {
      setAttacks(prev => [data, ...prev].slice(0, 200));
    });

    socket.on('stats_update', (data: Stats) => {
      setStats(data);
    });

    socket.on('new_alert', (data: any) => {
      setAlerts(prev => [data, ...prev].slice(0, 10));
    });

    socket.on('dashboard_reset', () => {
      setAttacks([]);
      setAlerts([]);
    });

    return () => {
      socket.off('new_attack');
      socket.off('stats_update');
      socket.off('new_alert');
      socket.off('dashboard_reset');
    };
  }, []);

  return (
    <div className="min-h-screen bg-cyber-black text-on-surface font-mono selection:bg-primary selection:text-cyber-black overflow-x-hidden flex pl-72">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative">
        <TopBar attacksPerSecond={stats?.attacksPerSecond || 0} />

        <main className="p-12 pb-24">
          <AnimatePresence mode="wait">
            {activeTab === 'monitor' && (
              <motion.div key="monitor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-12 gap-8">
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Traffic" value={stats?.totalAttempts || 0} sub={`+${stats?.attacksPerSecond || 0}/s`} icon={<Activity />} />
                  <StatCard title="Success Ratio" value={stats?.successRatio || '0/0'} sub="Successful Logins" icon={<CheckCircle2 />} success />
                  <StatCard title="Threat Alerts" value={stats?.alertCount || 0} sub="Requires Review" icon={<AlertTriangle />} danger />
                  <StatCard title="Blocked IPs" value={stats?.ipsBlocked || 0} sub="Firewall Active" icon={<Shield />} />
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-8">
                  <div className="cyber-panel p-8 min-h-[450px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <h2 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">Network Intensity Stream</h2>
                        <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.3em]">Real-time telemetry analysis // Stream_01</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20"><BarChart3 className="text-primary" size={20} /></div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockChartData}>
                          <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="time" stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #00f2ff20', borderRadius: '12px', fontSize: '10px' }} itemStyle={{ color: '#00f2ff' }} />
                          <Area type="monotone" dataKey="value" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="cyber-panel bg-cyber-black/60 h-[400px] flex flex-col relative">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                      <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest"><div className="w-2 h-2 bg-primary rounded-full animate-pulse" />Live Log Stream // Event_Bus</div>
                      <div className="flex items-center gap-4"><Search size={14} className="text-on-surface/30" /><div className="h-4 w-[1px] bg-white/10" /><span className="text-[9px] text-on-surface/40 font-mono tracking-tighter uppercase">Socket_Active</span></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-2 terminal-scroll font-mono text-[11px]">
                      {attacks.map((attack, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={attack.id || i} className="grid grid-cols-12 gap-4 py-1 border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <span className="col-span-1 text-on-surface/20">[{attack.timestamp}]</span>
                          <span className={`col-span-1 font-bold ${attack.status === 'SUCCESS' ? 'text-cyber-green' : attack.status === 'BLOCKED' ? 'text-cyber-red' : 'text-on-surface/40'}`}>{attack.status}</span>
                          <span className="col-span-2 text-primary group-hover:text-white transition-colors">{attack.ip}</span>
                          <span className="col-span-2 text-cyber-yellow">{attack.username}</span>
                          <span className="col-span-4 text-on-surface/50 italic truncate">{attack.password || '********'}</span>
                          <div className="col-span-2 flex justify-end"><span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${attack.detection === 'HIGH' ? 'border-cyber-red bg-cyber-red/20 text-cyber-red' : 'border-white/10 text-on-surface/40'}`}>{attack.detection}</span></div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-8">
                  <div className="cyber-panel p-6 h-[400px] flex flex-col">
                    <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2"><Globe size={16} className="text-primary" />Geo-Threat Vectors</h3>
                    <div className="flex-1 space-y-6 overflow-y-auto terminal-scroll pr-2">
                      {['Russia', 'China', 'USA', 'Netherlands', 'Germany', 'Brazil', 'Vietnam'].map((country) => (
                        <div key={country} className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold"><span className="uppercase text-on-surface/60 tracking-widest">{country}</span><span className="text-primary">{Math.floor(Math.random() * 800) + 200} ATK</span></div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.random() * 70 + 30}%` }} className="h-full bg-gradient-to-r from-primary/20 to-primary shadow-[0_0_8px_rgba(0,242,255,0.4)]" /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cyber-panel p-6">
                    <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><List size={16} className="text-primary" />Critical Alerts</h3>
                    <div className="space-y-4">
                      {alerts.slice(0, 5).map((alert, i) => (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={alert.id || i} className={`p-4 rounded-xl border-l-4 ${alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'border-cyber-red bg-cyber-red/5' : 'border-cyber-yellow bg-cyber-yellow/5'}`}>
                          <div className="flex justify-between text-[9px] font-black uppercase mb-2"><span className={alert.severity === 'HIGH' || alert.severity === 'CRITICAL' ? 'text-cyber-red' : 'text-cyber-yellow'}>{alert.severity}</span><span className="text-on-surface/40">{alert.timestamp}</span></div>
                          <p className="text-[10px] text-on-surface/80 leading-relaxed font-mono">{alert.message}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'bruteforce' && (
              <motion.div key="bruteforce" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full min-h-[600px]">
                <HydraLab />
              </motion.div>
            )}
            {activeTab === 'network' && (
              <motion.div key="network" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full min-h-[600px]">
                <WiresharkView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 group relative overflow-hidden ${active ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_20px_rgba(0,242,255,0.1)]' : 'text-on-surface/40 hover:text-white hover:bg-white/5'}`}>
      <span className={`${active ? 'text-primary' : 'text-on-surface/30 group-hover:text-primary'} transition-colors`}>{icon}</span>
      {label}
      {active && (<motion.div layoutId="sidebarActive" className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />)}
    </button>
  );
}

function StatCard({ title, value, sub, icon, danger = false, success = false }: any) {
  return (
    <div className="cyber-panel p-6 group hover:border-primary/40 transition-all duration-500 relative">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[10px] text-on-surface/40 uppercase tracking-[0.3em] font-black mb-3">{title}</div>
          <div className={`text-4xl font-display font-black tracking-tighter ${danger ? 'text-cyber-red' : success ? 'text-cyber-green' : 'text-white'}`}>{value}</div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${danger ? 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red' : success ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green' : 'bg-primary/10 border-primary/20 text-primary group-hover:border-primary/50'}`}>{icon}</div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${danger ? 'bg-cyber-red animate-pulse' : success ? 'bg-cyber-green shadow-[0_0_8px_#00ff9d]' : 'bg-primary animate-pulse'}`} />
        <span className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">{sub}</span>
      </div>
    </div>
  );
}

const mockChartData = [
  { time: '00:00', value: 420 }, { time: '04:00', value: 310 }, { time: '08:00', value: 580 }, { time: '12:00', value: 450 }, { time: '16:00', value: 890 }, { time: '20:00', value: 620 }, { time: '23:59', value: 740 },
];
