
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'error' | 'warning';
  progress?: number;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  trend, 
  trendType = 'neutral', 
  icon: Icon, 
  color = 'primary',
  progress,
  className 
}: StatCardProps) {
  
  const colorClasses = {
    primary: 'text-primary border-primary/20 bg-primary/5',
    secondary: 'text-secondary border-secondary/20 bg-secondary/5',
    error: 'text-error border-error/20 bg-error/5',
    warning: 'text-orange-400 border-orange-400/20 bg-orange-400/5',
  };

  const glowClasses = {
    primary: 'shadow-[0_0_15px_rgba(173,198,255,0.1)]',
    secondary: 'shadow-[0_0_15px_rgba(78,222,163,0.1)]',
    error: 'shadow-[0_0_15px_rgba(255,180,171,0.1)]',
    warning: 'shadow-[0_0_15px_rgba(251,146,60,0.1)]',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 transition-all duration-300",
        colorClasses[color],
        glowClasses[color],
        className
      )}
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Icon size={48} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Icon size={14} className="opacity-70" />
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-70 font-bold">{title}</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h3 className="font-mono text-2xl font-bold tracking-tight text-on-surface">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </h3>
            {trend && (
              <p className={cn(
                "font-mono text-[9px] uppercase mt-1 flex items-center gap-1",
                trendType === 'positive' ? "text-secondary" : trendType === 'negative' ? "text-error" : "text-outline"
              )}>
                {trendType === 'positive' && '↑'}
                {trendType === 'negative' && '↓'}
                {trend}
              </p>
            )}
          </div>
          
          {progress !== undefined && (
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="stroke-surface-container-highest"
                  strokeDasharray="100, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${progress}, 100` }}
                  transition={{ duration: 1 }}
                  className={cn(
                    "stroke-current",
                    color === 'primary' ? "text-primary" : color === 'secondary' ? "text-secondary" : "text-error"
                  )}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[10px] font-bold">{progress}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Decorative Scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-5 scanline" />
    </motion.div>
  );
}
