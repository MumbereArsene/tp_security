import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AutoLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const processAutoLogin = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (token) {
        // Step 1: Inject token immediately into storage for the API call
        localStorage.setItem('token', token);
        
        try {
          // Step 2: Verify identity and role
          const res = await api.get('/me');
          const userData = res.data;
          
          // Step 3: Hydrate auth context
          login(token, userData);
          
          // Step 4: Final redirect
          if (userData.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/home');
          }
        } catch (e) {
          console.error("Auto-login identity check failed", e);
          localStorage.removeItem('token');
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    processAutoLogin();
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center font-mono text-primary">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="text-[10px] tracking-[0.5em] uppercase animate-pulse">
        Establishing Secure Tunnel...
      </div>
    </div>
  );
}
