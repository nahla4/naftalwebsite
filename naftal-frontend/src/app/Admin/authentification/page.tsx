'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const orange = '#fa8800';
const blue = '#013468';

export default function AdminAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(user => {
        if (user.role === 'admin') {
          window.location.href = '/Admin/dashboard';
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erreur lors de la connexion');
      } else {
        setMessage('Connexion réussie en tant qu\'administrateur !');
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('auth-change'));
        setTimeout(() => {
          window.location.href = '/Admin/dashboard';
        }, 800);
      }
    } catch (err) {
      setError('Erreur réseau ou serveur');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 font-sans p-6">
      <motion.div
        className="bg-slate-950 text-slate-100 rounded-2xl shadow-2xl p-10 w-full max-w-md border border-slate-800"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-slate-900 p-4 shadow-inner border border-orange-500">
            <span className="text-4xl">🛠️</span>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-wide text-orange-500">
          Portail Administrateur
        </h2>
        <p className="text-center text-slate-400 text-sm mb-8">
          Administration globale du système Naftfix
        </p>

        {error && (
          <div className="p-3 mb-4 bg-red-950 border border-red-800 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 mb-4 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg text-sm text-center">
            {message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 text-slate-300 font-medium text-sm">Adresse Email</label>
            <input
              type="email"
              placeholder="admin@naftal.dz"
              className="w-full rounded-lg px-4 py-3 bg-slate-900 text-white border border-slate-700 focus:outline-none focus:border-orange-500 transition text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 text-slate-300 font-medium text-sm">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg px-4 py-3 bg-slate-900 text-white border border-slate-700 focus:outline-none focus:border-orange-500 transition text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#fa8800] hover:bg-orange-600 rounded-lg font-semibold text-white transition-colors duration-200 shadow-md text-sm mt-4"
          >
            Se connecter à l'administration
          </button>
        </form>

        <div className="flex justify-center mt-8">
          <span className="text-xs text-slate-500">
            © {new Date().getFullYear()} Naftal. Accès restreint.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
