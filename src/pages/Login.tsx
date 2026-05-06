
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, Terminal, Fingerprint, Key, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { username, password });
      login(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black selection:bg-primary/30 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline" />
      
      {/* Background Decor */}
      <div className="fixed inset-0 grid-bg opacity-5 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-4 mb-4"
          >
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/50 pulse-primary">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-3xl font-black tracking-tighter text-on-surface uppercase leading-none cyber-glitch-text">CyberSOC <span className="text-primary italic">Alpha-1</span></h1>
              <span className="font-mono text-[9px] text-primary/60 uppercase tracking-[0.4em] leading-none">Security Node Access // v4.0.2</span>
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
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold text-on-surface uppercase tracking-tight">Identity Vault</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyber-green animate-pulse shadow-[0_0_8px_#00ff9d]" />
              <span className="font-mono text-[10px] font-bold text-cyber-green tracking-widest uppercase">Sec_Link_Active</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-cyber-red/10 border border-cyber-red/20 rounded-lg text-cyber-red text-[10px] font-mono uppercase tracking-widest"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-on-surface/40 uppercase tracking-[0.2em] block pl-1">Operator Alias</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-on-surface/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ROOT_ADMIN"
                  className="w-full bg-cyber-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface font-mono text-xs focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all outline-none placeholder:text-on-surface/20 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-mono text-[10px] text-on-surface/40 uppercase tracking-[0.2em] block">Encryption Key</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-on-surface/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-cyber-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface font-mono text-xs focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full cyber-button cyber-button-primary text-xs py-4 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Authorize Session'}</span>
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </form>

          <footer className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="font-mono text-[10px] text-on-surface/40 tracking-wider uppercase opacity-60 mb-6">
              Unauthorized access is strictly prohibited. All attempts are logged.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="text-[10px] text-primary hover:underline uppercase tracking-widest">Enroll New Node</Link>
            </div>
          </footer>
        </motion.main>
      </div>
    </div>
  );
}
