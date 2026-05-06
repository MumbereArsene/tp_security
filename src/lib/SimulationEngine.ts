
export interface AttackEvent {
  id: string;
  timestamp: string;
  username: string;
  password: string;
  ip: string;
  country: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  detection: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  intensity: number;
}

export interface Stats {
  totalAttempts: number;
  successCount: number;
  failedCount: number;
  blockedCount: number;
  attacksPerMinute: number;
  currentIntensity: number;
  firewallStatus: 'ACTIVE' | 'BYPASSED' | 'FILTERING';
  threatLevel: 'STABLE' | 'ELEVATED' | 'CRITICAL';
}

type Listener = (event: AttackEvent, stats: Stats) => void;

class SimulationEngine {
  private listeners: Listener[] = [];
  private events: AttackEvent[] = [];
  private stats: Stats = {
    totalAttempts: 1245000,
    successCount: 42,
    failedCount: 1244958,
    blockedCount: 4812,
    attacksPerMinute: 840,
    currentIntensity: 45,
    firewallStatus: 'ACTIVE',
    threatLevel: 'STABLE',
  };

  private usernames = ['admin', 'root', 'superuser', 'dev_ops', 'maintenance', 'guest', 'support', 'backup', 'system_auto', 'db_admin'];
  private passwords = ['123456', 'password', 'admin123', 'qwerty', 'summer2024', 'Guest123!', 'root_pass', 'system_key'];
  private countries = ['USA', 'China', 'Russia', 'Germany', 'Brazil', 'France', 'Japan', 'India', 'Canada', 'UK'];
  private blockedIPs: Set<string> = new Set();

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    const loop = () => {
      const delay = Math.max(100, 1000 - (this.stats.currentIntensity * 10));
      setTimeout(() => {
        this.generateEvent();
        loop();
      }, delay);
    };
    loop();

    // Randomly change intensity
    setInterval(() => {
      this.stats.currentIntensity = Math.floor(Math.random() * 100);
      this.stats.attacksPerMinute = 500 + (this.stats.currentIntensity * 20);
      
      if (this.stats.currentIntensity > 80) {
        this.stats.threatLevel = 'CRITICAL';
      } else if (this.stats.currentIntensity > 40) {
        this.stats.threatLevel = 'ELEVATED';
      } else {
        this.stats.threatLevel = 'STABLE';
      }
    }, 5000);
  }

  private generateEvent() {
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    let status: AttackEvent['status'] = 'FAILED';
    const rand = Math.random();
    
    if (this.blockedIPs.has(ip)) {
      status = 'BLOCKED';
    } else if (rand < 0.005) { // 0.5% success rate
      status = 'SUCCESS';
    } else if (rand > 0.95) { // 5% chance of blocking a new IP
      status = 'BLOCKED';
      this.blockedIPs.add(ip);
    }

    const event: AttackEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      username: this.usernames[Math.floor(Math.random() * this.usernames.length)],
      password: this.passwords[Math.floor(Math.random() * this.passwords.length)],
      ip,
      country: this.countries[Math.floor(Math.random() * this.countries.length)],
      status,
      detection: status === 'SUCCESS' ? 'CRITICAL' : (status === 'BLOCKED' ? 'MEDIUM' : 'LOW'),
      intensity: this.stats.currentIntensity,
    };

    this.stats.totalAttempts++;
    if (status === 'SUCCESS') this.stats.successCount++;
    if (status === 'FAILED') this.stats.failedCount++;
    if (status === 'BLOCKED') this.stats.blockedCount++;

    this.events.unshift(event);
    if (this.events.length > 100) this.events.pop();

    this.notifyListeners(event);
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(event: AttackEvent) {
    this.listeners.forEach(l => l(event, { ...this.stats }));
  }

  public getHistory() {
    return [...this.events];
  }

  public getStats() {
    return { ...this.stats };
  }
}

export const simulationEngine = new SimulationEngine();
