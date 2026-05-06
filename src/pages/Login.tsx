import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Lock, Terminal, Fingerprint, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSuccess, setAutoSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Handle Automatic Login from Attack Script
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlUser = params.get('username');
    const urlPass = params.get('password');
    
    if (urlUser && urlPass) {
      // 1. Visually fill the form
      setUsername(urlUser);
      setPassword(urlPass);
      setAutoSuccess(true);
      
      // 2. Perform a REAL login request after 1.5s delay for visual feedback
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await api.post('/login', { 
            username: urlUser, 
            password: urlPass 
          });
          const { token, user } = response.data;
          login(token, user);
          
          if (user.role === 'admin') navigate('/dashboard');
          else navigate('/home');
        } catch (err: any) {
          setError(err.response?.data?.msg || "Injected credentials rejected by server.");
          setAutoSuccess(false);
        } finally {
          setLoading(false);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [location, login, navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { username, password });
      const { token, user } = response.data;
      login(token, user);
      
      if (user.role === 'admin') navigate('/dashboard');
      else navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black selection:bg-primary/30 flex items-center justify-center p-6 relative overflow-hidden font-display">
      <div className="scanline" />
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
              <h1 className="font-display text-3xl font-black tracking-tighter text-on-surface uppercase leading-none">CyberSOC <span className="text-primary italic">Alpha-1</span></h1>
              <span className="font-mono text-[9px] text-primary/60 uppercase tracking-[0.4em] leading-none">Access Control // Session Injector</span>
            </div>
          </motion.div>
        </header>

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-panel p-10 relative overflow-hidden"
        >
          {/* Status Overlays */}
          <AnimatePresence>
            {(loading || autoSuccess) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-cyber-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6"
              >
                {autoSuccess && !loading ? (
                  <>
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-mono text-[10px] uppercase tracking-[0.4em] mb-2 font-bold">Credentials Found</div>
                      <div className="text-white/40 font-mono text-[9px] uppercase tracking-widest animate-pulse">Bypassing security layers...</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest animate-pulse font-bold tracking-[0.2em]">Executing Auth...</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold text-on-surface uppercase tracking-tight">Identity Vault</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-mono uppercase tracking-widest">
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-on-surface/40 uppercase tracking-[0.2em] block pl-1">Target Alias</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-on-surface/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-cyber-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface font-mono text-xs focus:border-primary transition-all outline-none uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-on-surface/40 uppercase tracking-[0.2em] block">Encryption Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-on-surface/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cyber-black/50 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-on-surface font-mono text-xs focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full cyber-button cyber-button-primary text-xs py-4 flex items-center justify-center gap-3">
                <span>Authorize Session</span>
                <Terminal className="w-4 h-4" />
              </button>
            </div>
          </form>

          <footer className="mt-10 pt-8 border-t border-white/5 text-center flex justify-center gap-6">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Status: Connected</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1" />
          </footer>
        </motion.main>
      </div>
    </div>
  );
}
