import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, AlertTriangle, Activity, Database, Globe, Terminal as TerminalIcon, 
  Lock, Unlock, Cpu, Zap, Radio, BarChart3, Network, Target, List, Search,
  ChevronRight, Box, Settings
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import HydraLab from '../components/HydraLab';
import WiresharkView from '../components/WiresharkView';

const socket = io('http://localhost:5000');

interface AttackData {
  id: number;
  timestamp: string;
  username: string;
  password?: string;
  ip: string;
  country: string;
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
}

export default function Dashboard() {
  const [attacks, setAttacks] = useState<AttackData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'monitor' | 'bruteforce' | 'network'>('monitor');

  useEffect(() => {
    fetchStats();
    fetchAlerts();

    socket.on('new_attack', (data: AttackData) => {
      setAttacks(prev => [data, ...prev].slice(0, 50));
    });

    socket.on('stats_update', (data: Stats) => {
      setStats(data);
    });

    socket.on('new_alert', (data: any) => {
      setAlerts(prev => [data, ...prev].slice(0, 10));
    });

    return () => {
      socket.off('new_attack');
      socket.off('stats_update');
      socket.off('new_alert');
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-on-surface font-mono selection:bg-primary selection:text-cyber-black overflow-x-hidden flex">
      <div className="scanline"></div>
      
      {/* PROFESSIONAL SIDEBAR */}
      <aside className="w-72 border-r border-white/10 bg-cyber-dark/80 backdrop-blur-2xl h-screen sticky top-0 z-50 flex flex-col">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/50 shadow-[0_0_20px_rgba(0,242,255,0.2)]">
              <Shield className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-display font-black tracking-tighter text-white uppercase leading-none">CyberSOC</h1>
              <span className="text-[10px] text-primary/60 font-bold tracking-[0.2em]">COMMAND_CENTER</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-cyber-black/60 rounded-full border border-white/5 w-fit">
            <span className="w-2 h-2 bg-cyber-green rounded-full animate-pulse shadow-[0_0_8px_#00ff9d]" />
            <span className="text-[9px] font-bold text-cyber-green uppercase tracking-widest">System_Active</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8">
          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-bold text-on-surface/30 uppercase tracking-[0.3em] mb-4">Operations</h3>
            <SidebarLink 
              active={activeTab === 'monitor'} 
              onClick={() => setActiveTab('monitor')} 
              icon={<Activity size={20} />} 
              label="Live Monitoring" 
            />
            <SidebarLink 
              active={activeTab === 'bruteforce'} 
              onClick={() => setActiveTab('bruteforce')} 
              icon={<Target size={20} />} 
              label="Attack Simulator" 
            />
            <SidebarLink 
              active={activeTab === 'network'} 
              onClick={() => setActiveTab('network')} 
              icon={<Network size={20} />} 
              label="Packet Inspector" 
            />
          </div>

          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-bold text-on-surface/30 uppercase tracking-[0.3em] mb-4">Threat Intelligence</h3>
            <div className="px-4 py-3 bg-cyber-black/40 rounded-xl border border-white/5 group hover:border-primary/20 transition-all cursor-default">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] text-on-surface/50 font-bold uppercase">Risk Index</span>
                 <span className={`text-[10px] font-bold ${stats?.threatLevel === 'CRITICAL' ? 'text-cyber-red' : 'text-cyber-green'}`}>
                   {stats?.threatLevel || 'STABLE'}
                 </span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stats?.threatLevel === 'CRITICAL' ? '90%' : '25%' }}
                    className={`h-full ${stats?.threatLevel === 'CRITICAL' ? 'bg-cyber-red shadow-[0_0_10px_#ff0055]' : 'bg-cyber-green shadow-[0_0_10px_#00ff9d]'}`} 
                 />
               </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-cyber-black/20">
          <button 
            onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
            className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-cyber-red/10 border border-white/10 hover:border-cyber-red/30 rounded-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyber-black group-hover:bg-cyber-red/20 transition-colors">
                <Unlock className="w-4 h-4 text-on-surface/60 group-hover:text-cyber-red" />
              </div>
              <span className="text-xs font-bold text-on-surface/60 group-hover:text-white uppercase tracking-widest">Terminate</span>
            </div>
            <ChevronRight className="w-4 h-4 text-on-surface/20 group-hover:text-cyber-red" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        <header className="h-20 border-b border-white/5 bg-cyber-black/20 backdrop-blur-md flex items-center justify-between px-12">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Box size={16} className="text-primary" />
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface/40 font-bold uppercase tracking-[0.2em]">Current Node</span>
                <span className="text-xs font-display text-white uppercase tracking-widest">SYSTEM_ALPHA / {activeTab}</span>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-on-surface/30 uppercase font-bold mb-1">Packet Throughput</span>
                <div className="flex items-center gap-3 text-xs font-bold text-primary">
                  <Radio size={14} className="animate-pulse" />
                  1.24 GB/S
                </div>
              </div>
              <div className="h-10 w-[1px] bg-white/5" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-on-surface/30 uppercase font-bold mb-1">Encryption Mode</span>
                <div className="text-xs font-bold text-cyber-yellow">AES-256_GCM</div>
              </div>
           </div>
        </header>

        <main className="p-12 pb-24">
          <AnimatePresence mode="wait">
            {activeTab === 'monitor' && (
              <motion.div 
                key="monitor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-12 gap-8"
              >
                {/* Stats Grid */}
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Traffic" value={stats?.totalAttempts || 0} sub={`+${stats?.attacksPerSecond || 0}/s`} icon={<Activity />} />
                  <StatCard title="Blocked IPs" value={stats?.ipsBlocked || 0} sub="Firewall Active" icon={<Shield />} />
                  <StatCard title="Threat Alerts" value={stats?.alertCount || 0} sub="Requires Review" icon={<AlertTriangle />} danger />
                  <StatCard title="Auth Failures" value={stats?.failedCount || 0} sub="Simulated" icon={<Lock />} />
                </div>

                {/* Live Visualization */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  <div className="cyber-panel p-8 min-h-[450px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <h2 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">Network Intensity Stream</h2>
                        <p className="text-[10px] text-on-surface/40 uppercase tracking-[0.3em]">Real-time telemetry analysis // Buffer_04</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <BarChart3 className="text-primary" size={20} />
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockChartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="time" stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#ffffff10" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #00f2ff20', borderRadius: '12px', fontSize: '10px' }}
                            itemStyle={{ color: '#00f2ff' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Log Terminal */}
                  <div className="cyber-panel bg-cyber-black/60 h-[400px] flex flex-col relative">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                      <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase tracking-widest">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        Live Log Stream // Node_Input
                      </div>
                      <div className="flex items-center gap-4">
                        <Search size={14} className="text-on-surface/30" />
                        <div className="h-4 w-[1px] bg-white/10" />
                        <span className="text-[9px] text-on-surface/40 font-mono tracking-tighter">SEC_LEVEL_04</span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-2 terminal-scroll font-mono text-[11px]">
                      {attacks.map((attack, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i} 
                          className="grid grid-cols-12 gap-4 py-1 border-b border-white/5 hover:bg-white/5 transition-colors group"
                        >
                          <span className="col-span-1 text-on-surface/20">[{attack.timestamp}]</span>
                          <span className={`col-span-1 font-bold ${
                            attack.status === 'SUCCESS' ? 'text-cyber-green' : 
                            attack.status === 'BLOCKED' ? 'text-cyber-red' : 'text-on-surface/40'
                          }`}>
                            {attack.status}
                          </span>
                          <span className="col-span-2 text-primary group-hover:text-white transition-colors">{attack.ip}</span>
                          <span className="col-span-2 text-cyber-yellow">{attack.username}</span>
                          <span className="col-span-4 text-on-surface/50 italic truncate">{attack.password || '********'}</span>
                          <div className="col-span-2 flex justify-end">
                             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                               attack.detection === 'CRITICAL' ? 'border-cyber-red bg-cyber-red/20 text-cyber-red' : 'border-white/10 text-on-surface/40'
                             }`}>
                               {attack.detection}
                             </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar Widgets */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                  <div className="cyber-panel p-6 h-[400px] flex flex-col">
                    <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Globe size={16} className="text-primary" />
                      Geo-Threat Vectors
                    </h3>
                    <div className="flex-1 space-y-6 overflow-y-auto terminal-scroll pr-2">
                      {['Russia', 'China', 'USA', 'Netherlands', 'Germany', 'Brazil', 'Vietnam'].map((country) => (
                        <div key={country} className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="uppercase text-on-surface/60 tracking-widest">{country}</span>
                            <span className="text-primary">{Math.floor(Math.random() * 800) + 200} ATK</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.random() * 70 + 30}%` }}
                              className="h-full bg-gradient-to-r from-primary/20 to-primary shadow-[0_0_8px_rgba(0,242,255,0.4)]" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cyber-panel p-6">
                    <h3 className="text-xs font-display font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                      <List size={16} className="text-primary" />
                      Critical Alerts
                    </h3>
                    <div className="space-y-4">
                      {alerts.slice(0, 5).map((alert, i) => (
                        <div key={i} className={`p-4 rounded-xl border-l-4 ${
                          alert.severity === 'CRITICAL' ? 'border-cyber-red bg-cyber-red/5' : 'border-cyber-yellow bg-cyber-yellow/5'
                        }`}>
                          <div className="flex justify-between text-[9px] font-black uppercase mb-2">
                            <span className={alert.severity === 'CRITICAL' ? 'text-cyber-red' : 'text-cyber-yellow'}>{alert.severity}</span>
                            <span className="text-on-surface/40">{alert.timestamp}</span>
                          </div>
                          <p className="text-[10px] text-on-surface/80 leading-relaxed font-mono">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bruteforce' && (
              <motion.div key="bruteforce" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <HydraLab />
              </motion.div>
            )}

            {activeTab === 'network' && (
              <motion.div key="network" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <WiresharkView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="fixed bottom-0 left-72 right-0 bg-cyber-dark/95 border-t border-white/10 px-8 py-3 flex items-center justify-between text-[10px] z-50 backdrop-blur-2xl">
          <div className="flex gap-8 items-center">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00f2ff]" />
              Core_Engine_v1.0.4
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-on-surface/40 font-bold uppercase tracking-widest">Latency: 8ms</span>
            <span className="text-on-surface/40 font-bold uppercase tracking-widest">IO: Stable</span>
          </div>
          <div className="flex gap-8 items-center">
            <div className="flex items-center gap-4">
               <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: [-100, 200] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="w-24 h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" 
                  />
               </div>
               <span className="text-primary/60 font-black uppercase tracking-[0.2em]">Buffer_Ok</span>
            </div>
            <span className="text-on-surface/60 font-mono tracking-widest text-[11px]">{new Date().toLocaleTimeString()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 group relative overflow-hidden ${
        active 
          ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
          : 'text-on-surface/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className={`${active ? 'text-primary' : 'text-on-surface/30 group-hover:text-primary'} transition-colors`}>
        {icon}
      </span>
      {label}
      {active && (
        <motion.div 
          layoutId="sidebarActive"
          className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
        />
      )}
    </button>
  );
}

function StatCard({ title, value, sub, icon, danger = false }: any) {
  return (
    <div className="cyber-panel p-6 group hover:border-primary/40 transition-all duration-500 relative">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="text-[10px] text-on-surface/40 uppercase tracking-[0.3em] font-black mb-3">{title}</div>
          <div className={`text-4xl font-display font-black tracking-tighter ${danger ? 'text-cyber-red cyber-glitch-text' : 'text-white'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${
          danger ? 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red' : 'bg-primary/10 border-primary/20 text-primary group-hover:border-primary/50'
        }`}>
          {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${danger ? 'bg-cyber-red animate-pulse' : 'bg-cyber-green shadow-[0_0_8px_#00ff9d]'}`} />
        <span className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">{sub}</span>
      </div>
    </div>
  );
}

const mockChartData = [
  { time: '00:00', value: 420 },
  { time: '04:00', value: 310 },
  { time: '08:00', value: 580 },
  { time: '12:00', value: 450 },
  { time: '16:00', value: 890 },
  { time: '20:00', value: 620 },
  { time: '23:59', value: 740 },
];
