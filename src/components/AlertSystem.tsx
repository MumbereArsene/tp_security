
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../lib/useSimulation';
import { ShieldAlert, X, Zap, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
}

export function AlertSystem() {
  const { lastEvent } = useSimulation();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (lastEvent?.status === 'SUCCESS') {
      const newAlert: Alert = {
        id: Math.random().toString(),
        type: 'CRITICAL',
        title: 'INTRUSION DETECTED',
        message: `System breach! User ${lastEvent.username} authenticated from ${lastEvent.ip}.`
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 3));
      
      // Auto remove after 5s
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
      }, 5000);
    } else if (lastEvent?.status === 'BLOCKED') {
       // Only show blocked if it's high intensity to avoid spam
       if (lastEvent.intensity > 80) {
          const newAlert: Alert = {
            id: Math.random().toString(),
            type: 'WARNING',
            title: 'FIREWALL BLOCK',
            message: `IP ${lastEvent.ip} has been blacklisted due to brute force signature.`
          };
          setAlerts(prev => [newAlert, ...prev].slice(0, 3));
          setTimeout(() => {
            setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
          }, 3000);
       }
    }
  }, [lastEvent]);

  return (
    <div className="fixed top-20 right-6 z-[100] w-80 space-y-3 pointer-events-none">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className={cn(
              "p-4 rounded-lg border-2 pointer-events-auto shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden",
              alert.type === 'CRITICAL' ? "bg-error/20 border-error text-error" : "bg-warning/20 border-warning text-warning"
            )}
          >
            {/* Animated background bar */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className={cn(
                "absolute top-0 left-0 w-1/2 h-0.5 opacity-50",
                alert.type === 'CRITICAL' ? "bg-error" : "bg-warning"
              )}
            />

            <div className="flex gap-3">
              <div className={cn(
                "p-2 rounded-md h-fit shrink-0",
                alert.type === 'CRITICAL' ? "bg-error/20" : "bg-warning/20"
              )}>
                {alert.type === 'CRITICAL' ? <ShieldAlert size={20} className="animate-pulse" /> : <Zap size={20} />}
              </div>
              <div className="flex-1">
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest">{alert.title}</h4>
                <p className="font-mono text-[10px] mt-1 leading-relaxed opacity-90">{alert.message}</p>
              </div>
              <button 
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className="hover:opacity-100 opacity-50 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>

            {/* Matrix rain decoration */}
            <div className="absolute -bottom-2 -right-2 opacity-10 font-mono text-[40px] select-none pointer-events-none rotate-12">
               {alert.type === 'CRITICAL' ? '!!' : '??'}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
