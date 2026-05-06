import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Mail, Shield, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserHome() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-blue-600 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30">
              <User size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Bienvenue, {user?.username}</h1>
            <p className="text-blue-100 text-lg">Votre session est sécurisée et active.</p>
          </div>
        </div>

        <div className="p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3 text-gray-400 mb-2 uppercase text-[10px] font-bold tracking-widest">
                <Mail size={14} />
                Adresse Email
              </div>
              <div className="text-gray-900 font-medium">{user?.username}@university.edu</div>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3 text-gray-400 mb-2 uppercase text-[10px] font-bold tracking-widest">
                <Clock size={14} />
                Dernière Connexion
              </div>
              <div className="text-gray-900 font-medium">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield size={20} className="text-yellow-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-yellow-800">Alerte de Sécurité</h4>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Plusieurs tentatives de connexion suspectes ont été détectées sur votre compte. Votre session a été automatiquement restaurée suite à une validation externe.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-bold text-sm shadow-lg shadow-gray-200"
              >
                <LogOut size={18} />
                Se déconnecter
              </button>
              
              <a href="#" className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                Paramètres du compte <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-12 py-6 text-center border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
            Propulsé par CyberSOC Alpha-1 Security Infrastructure
          </p>
        </div>
      </motion.div>
    </div>
  );
}
