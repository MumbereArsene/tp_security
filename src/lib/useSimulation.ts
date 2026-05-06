
import { useState, useEffect } from 'react';
import { socket } from '../services/socket';
import api from '../services/api';

export interface AttackEvent {
  id: string;
  timestamp: string;
  username: string;
  password: string;
  ip: string;
  country: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  detection: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
}

export interface Stats {
  totalAttempts: number;
  successCount: number;
  failedCount: number;
  blockedCount: number;
  ipsBlocked: number;
  attacksPerMinute: number;
  threatLevel: 'STABLE' | 'ELEVATED' | 'CRITICAL';
}

export function useSimulation() {
  const [events, setEvents] = useState<AttackEvent[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalAttempts: 0,
    successCount: 0,
    failedCount: 0,
    blockedCount: 0,
    ipsBlocked: 0,
    attacksPerMinute: 0,
    threatLevel: 'STABLE',
  });
  const [lastEvent, setLastEvent] = useState<AttackEvent | null>(null);

  useEffect(() => {
    // Initial fetch for logs and stats
    const fetchInitialData = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          api.get('/logs?limit=50'),
          api.get('/stats')
        ]);
        setEvents(logsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching initial SOC data:', error);
      }
    };

    fetchInitialData();

    // Socket Listeners
    socket.on('new_attack', (event: AttackEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 50));
      setLastEvent(event);
    });

    socket.on('stats_update', (newStats: Stats) => {
      setStats(newStats);
    });

    return () => {
      socket.off('new_attack');
      socket.off('stats_update');
    };
  }, []);

  return { events, stats, lastEvent };
}
