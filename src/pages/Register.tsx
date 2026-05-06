import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/register', { username, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black selection:bg-secondary/30 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline" />
      <div className="fixed inset-0 grid-bg opacity-5 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center border border-secondary/50 pulse-secondary">
              <ShieldAlert className="w-8 h-8 text-secondary" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-3xl font-black tracking-tighter text-on-surface uppercase leading-none cyber-glitch-text">CyberSOC <span className="text-secondary italic">Alpha-1</span></h1>
              <span className="font-mono text-[9px] text-secondary/60 uppercase tracking-[0.4em] leading-none">Security Node Enrollment // INIT</span>
            </div>
          </motion.div>
        </header>

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-panel p-10 relative overflow-hidden group shadow-2xl"
        >
          <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg border border-secondary/20">
                <User className="w-5 h-5 text-secondary" />
              </div>
              <h2 className="font-display text-lg font-bold text-on-surface uppercase tracking-tight">New Operator</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#00f2ff]" />
              <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase">Init_Active</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-cyber-red/10 border border-cyber-red/20 rounded-lg text-cyber-red text-[10px] font-mono uppercase tracking-widest">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-3 p-4 bg-cyber-green/10 border border-cyber-green/20 rounded-lg text-cyber-green text-[10px] font-mono uppercase tracking-widest">
                <CheckCircle size={16} />
                Enrollment Successful. Redirecting...
              </div>
            )}

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-on-surface/40 uppercase tracking-[0.2em] block pl-1">Protocol Alias</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-on-surface/40 group-focus-within:text-secondary transition-colors" />
                </div>
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="NEW_IDENTITY_01"
                  className="w-full bg-cyber-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface font-mono text-xs focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all outline-none placeholder:text-on-surface/20 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-on-surface/40 uppercase tracking-[0.2em] block pl-1">Comm Channel (Email)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-on-surface/40 group-focus-within:text-secondary transition-colors" />
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="OPS@SYSTEM.INTERNAL"
                  className="w-full bg-cyber-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface font-mono text-xs focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all outline-none placeholder:text-on-surface/20 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-on-surface/40 uppercase tracking-[0.2em] block pl-1">Primary Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-on-surface/40 group-focus-within:text-secondary transition-colors" />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-cyber-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface font-mono text-xs focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading || success}
                className="w-full cyber-button bg-secondary text-cyber-black font-bold text-xs py-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : 'Initialize Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <footer className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="font-mono text-[10px] text-on-surface/40 tracking-wider uppercase opacity-60 mb-6">
              Already have operational clearance? 
              <Link to="/" className="text-secondary font-bold hover:underline underline-offset-4 ml-1">Relink Session</Link>
            </p>
          </footer>
        </motion.main>
      </div>
    </div>
  );
}
