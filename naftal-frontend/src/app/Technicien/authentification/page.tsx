'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const orange = '#fa8800';
const blue = '#013468';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function TechnicienAuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In state
  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');

  // Sign Up state
  const [fullName, setFullName] = useState('');
  const [emailSignUp, setEmailSignUp] = useState('');
  const [passwordSignUp, setPasswordSignUp] = useState('');
  const [specialiteId, setSpecialiteId] = useState('');

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
        if (user.role === 'technicien') {
          window.location.href = '/Technicien/dashboard';
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/technicien/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailSignIn, password: passwordSignIn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur lors de la connexion');
      } else {
        setMessage('Connexion réussie !');
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('auth-change'));
        setTimeout(() => {
          window.location.href = '/Technicien/dashboard';
        }, 800);
      }
    } catch {
      setError('Erreur réseau ou serveur');
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!specialiteId) {
      setError('Veuillez sélectionner une spécialité');
      return;
    }
    // Call your backend API for technicien registration
    try {
      const res = await fetch('http://localhost:5000/api/auth/technicien/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: fullName,
          email: emailSignUp,
          password: passwordSignUp,
          specialite_id: Number(specialiteId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur lors de l\'inscription');
      } else {
        setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setTab('signin');
        setFullName('');
        setEmailSignUp('');
        setPasswordSignUp('');
        setSpecialiteId('');
      }
    } catch {
      setError('Erreur réseau ou serveur');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 font-sans">
      <motion.div
        className="bg-[#0a1a2f] rounded-lg shadow-xl p-10 w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h2 className="text-4xl font-bold text-center mb-8 text-orange-500">Espace Technicien Naftal</h2>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-6 py-2 rounded-full font-semibold transition ${
              tab === 'signin' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setTab('signin')}
          >
            Connexion
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition ${
              tab === 'signup' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setTab('signup')}
          >
            Inscription
          </button>
        </div>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        {message && <p className="text-green-400 mb-4 text-center">{message}</p>}

        {tab === 'signin' ? (
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label className="block mb-1 text-gray-400">Email</label>
              <input
                type="email"
                placeholder="technicien@naftal.dz"
                className="w-full rounded-md px-4 py-3 bg-gray-800 text-white border border-transparent focus:outline-none focus:border-orange-500"
                value={emailSignIn}
                onChange={(e) => setEmailSignIn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-400">Mot de passe</label>
              <input
                type="password"
                placeholder="Votre mot de passe"
                className="w-full rounded-md px-4 py-3 bg-gray-800 text-white border border-transparent focus:outline-none focus:border-orange-500"
                value={passwordSignIn}
                onChange={(e) => setPasswordSignIn(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 rounded-md font-semibold text-white hover:bg-orange-600 transition"
            >
              Se connecter
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <label className="block mb-1 text-gray-400">Nom complet</label>
              <input
                type="text"
                placeholder="Nom et prénom"
                className="w-full rounded-md px-4 py-3 bg-gray-800 text-white border border-transparent focus:outline-none focus:border-orange-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-400">Email</label>
              <input
                type="email"
                placeholder="technicien@naftal.dz"
                className="w-full rounded-md px-4 py-3 bg-gray-800 text-white border border-transparent focus:outline-none focus:border-orange-500"
                value={emailSignUp}
                onChange={(e) => setEmailSignUp(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-400">Mot de passe</label>
              <input
                type="password"
                placeholder="Choisissez un mot de passe"
                className="w-full rounded-md px-4 py-3 bg-gray-800 text-white border border-transparent focus:outline-none focus:border-orange-500"
                value={passwordSignUp}
                onChange={(e) => setPasswordSignUp(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-400">Spécialité</label>
              <select
                className="w-full rounded-md px-4 py-3 bg-gray-800 text-white border border-transparent focus:outline-none focus:border-orange-500"
                value={specialiteId}
                onChange={(e) => setSpecialiteId(e.target.value)}
                required
              >
                <option value="">Sélectionner une spécialité</option>
                <option value="1">Informatique</option>
                <option value="2">Maintenance industrielle</option>
                <option value="3">Électricité</option>
                <option value="4">Mécanique</option>
                <option value="5">Laboratoire</option>
                <option value="6">Technicien sécurité incendie</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 rounded-md font-semibold text-white hover:bg-orange-600 transition"
            >
              S'inscrire
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
