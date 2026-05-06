
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulation } from '../lib/useSimulation';
import { Activity } from 'lucide-react';

export function AttackChart() {
  const { stats } = useSimulation();
  const [data, setData] = useState<{ time: string; attempts: number; success: number }[]>([]);

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    
    setData(prev => {
      const newData = [...prev, { 
        time: timeStr, 
        attempts: stats.attacksPerMinute + (Math.random() * 50 - 25),
        success: stats.successCount
      }];
      return newData.slice(-20);
    });
  }, [stats.totalAttempts]); // Update whenever total attempts change (roughly every second)

  return (
    <div className="bg-surface-container/30 border border-outline-variant/20 rounded-lg p-6 h-full flex flex-col shadow-lg backdrop-blur-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity size={18} className="text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface">Attack Intensity Flux</h3>
            <p className="font-mono text-[10px] text-outline uppercase">Real-time throughput (PPS)</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#adc6ff]" />
            <span className="font-mono text-[10px] text-outline uppercase">Attempts</span>
          </div>
          <div className="px-2 py-1 bg-surface-container-highest rounded border border-outline-variant/30">
            <span className="font-mono text-[10px] text-primary font-bold">LIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#adc6ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#adc6ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#424754" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#8c909f" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              hide
            />
            <YAxis 
              stroke="#8c909f" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#171f33', 
                border: '1px solid #424754', 
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
              itemStyle={{ color: '#adc6ff' }}
            />
            <Area 
              type="monotone" 
              dataKey="attempts" 
              stroke="#adc6ff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAttempts)" 
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative Matrix overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[...Array(10)].map((_, i) => (
            <text key={i} x={i * 10} y="0" fontSize="8" fill="currentColor">
              <animate attributeName="y" from="0" to="100" dur={`${2 + Math.random() * 2}s`} repeatCount="indefinite" />
              {Math.random() > 0.5 ? '1' : '0'}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
