import React, { useState } from 'react';
import { Terminal, Copy, Zap, Info, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HydraLab() {
  const [username, setUsername] = useState('admin');
  const [targetIp, setTargetIp] = useState('192.168.1.5');
  const [wordlist, setWordlist] = useState('/usr/share/wordlists/rockyou.txt');
  
  const hydraCommand = `hydra -l ${username} -P ${wordlist} ${targetIp} http-post-form "/api/login:username=^USER^&password=^PASS^:F=Bad username or password" -V`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hydraCommand);
    alert('Command copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="cyber-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyber-yellow/10 border border-cyber-yellow/30 rounded">
            <Zap className="text-cyber-yellow" size={20} />
          </div>
          <h2 className="text-xl font-display uppercase">Brute Force Lab Generator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] text-on-surface/40 uppercase font-bold">Target Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-cyber-black/50 border border-white/10 rounded p-2 text-xs font-mono text-primary outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-on-surface/40 uppercase font-bold">Target IP / Domain</label>
            <input 
              type="text" 
              value={targetIp} 
              onChange={(e) => setTargetIp(e.target.value)}
              className="w-full bg-cyber-black/50 border border-white/10 rounded p-2 text-xs font-mono text-primary outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-on-surface/40 uppercase font-bold">Wordlist Path (Kali)</label>
            <input 
              type="text" 
              value={wordlist} 
              onChange={(e) => setWordlist(e.target.value)}
              className="w-full bg-cyber-black/50 border border-white/10 rounded p-2 text-xs font-mono text-primary outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="bg-cyber-black rounded-lg border border-white/5 p-4 relative group">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-on-surface/40 font-mono">HYDRA_CMD_GENERATOR_V1.0</span>
            <button 
              onClick={copyToClipboard}
              className="text-[10px] text-primary hover:text-white flex items-center gap-1 transition-colors"
            >
              <Copy size={12} />
              COPY_COMMAND
            </button>
          </div>
          <code className="text-xs text-cyber-green font-mono break-all leading-relaxed">
            {hydraCommand}
          </code>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cyber-panel p-5 border-primary/20">
          <h3 className="text-xs font-display text-primary mb-4 flex items-center gap-2 uppercase">
            <Info size={14} />
            Execution Guide
          </h3>
          <ul className="space-y-3 text-[11px] text-on-surface/70 font-mono">
            <li className="flex gap-2">
              <span className="text-primary font-bold">01.</span>
              Start your Kali Linux machine or any environment with Hydra installed.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">02.</span>
              Ensure you have network connectivity to the Target Web App.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">03.</span>
              Execute the generated command in your terminal.
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">04.</span>
              Monitor the SOC Dashboard in real-time to see your IP get blocked!
            </li>
          </ul>
        </div>

        <div className="cyber-panel p-5 border-cyber-red/20">
          <h3 className="text-xs font-display text-cyber-red mb-4 flex items-center gap-2 uppercase">
            <ShieldAlert size={14} />
            Security Warning
          </h3>
          <p className="text-[10px] text-on-surface/60 font-mono leading-relaxed">
            This simulator is designed for EDUCATIONAL PURPOSES only. 
            Brute forcing systems you do not own or have explicit permission to test 
            is ILLEGAL and UNETHICAL. Use this laboratory to understand how SOC 
            analysts detect and mitigate automated attacks.
          </p>
        </div>
      </div>
    </div>
  );
}
