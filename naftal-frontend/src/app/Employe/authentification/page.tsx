'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const orange = '#fa8800';
const blue = '#013468';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function EmployeAuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  // State for login form inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State for registration form inputs
  const [regNomComplet, setRegNomComplet] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartementId, setRegDepartementId] = useState('');

  // State for feedback messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        if (user.role === 'employe') {
          window.location.href = '/Employe/dashboard';
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/employe/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur lors de la connexion');
      } else {
        setMessage('Connexion réussie !');
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('auth-change'));
        setTimeout(() => {
          window.location.href = '/Employe/dashboard';
        }, 800);
      }
    } catch (err) {
      setError('Erreur réseau ou serveur');
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!regDepartementId) {
      setError('Veuillez sélectionner un département');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/employe/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: regNomComplet,
          email: regEmail,
          password: regPassword,
          departement_id: parseInt(regDepartementId, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur lors de l\'inscription');
      } else {
        setMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        // Optionally auto-switch to login mode:
        setIsSignIn(true);
        // Clear registration form
        setRegNomComplet('');
        setRegEmail('');
        setRegPassword('');
        setRegDepartementId('');
      }
    } catch (err) {
      setError('Erreur réseau ou serveur');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center font-sans">
      <motion.div
        className="w-full max-w-xl p-8 sm:p-12 bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex justify-center mb-2"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          <div className="rounded-full bg-white p-3 shadow-lg flex items-center justify-center border-4 border-orange-500" style={{ borderColor: orange }}>
            <span className="text-4xl font-extrabold" style={{ color: orange }}>⛽</span>
          </div>
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-4xl font-extrabold text-center mb-2 tracking-wide"
          style={{ color: orange }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Espace Employé Naftal
        </motion.h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Accédez à votre espace personnel pour signaler et suivre le matériel détruit.
        </p>

        <div className="flex justify-center gap-4">
          <button
            className={`
              px-5 py-2 rounded-full font-semibold transition-colors
              ${isSignIn ? 'bg-[#013468] text-white' : 'bg-gray-200 text-gray-700 hover:bg-[#013468] hover:text-white dark:bg-gray-800 dark:text-gray-300'}
            `}
            onClick={() => setIsSignIn(true)}
          >
            Se connecter
          </button>
          <button
            className={`
              px-5 py-2 rounded-full font-semibold transition-colors
              ${!isSignIn ? 'bg-[#fa8800] text-white' : 'bg-gray-200 text-gray-700 hover:bg-[#fa8800] hover:text-white dark:bg-gray-800 dark:text-gray-300'}
            `}
            onClick={() => setIsSignIn(false)}
          >
            S'inscrire
          </button>
        </div>

        {/* Show error or success message */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        {message && (
          <div className="p-3 bg-green-100 text-green-700 rounded">{message}</div>
        )}

        <AnimatePresence mode="wait">
          {isSignIn ? (
            <motion.form
              key="signin"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
              onSubmit={handleLoginSubmit}
            >
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Email</label>
                <input
                  type="email"
                  placeholder="nom.prenom@naftal.dz"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 outline-none transition"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Mot de passe</label>
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 outline-none transition"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-lg font-semibold text-lg bg-[#fa8800] text-white shadow-md transition hover:bg-[#e37400]"
                style={{ backgroundColor: orange }}
              >
                Se connecter
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
              onSubmit={handleRegisterSubmit}
            >
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Nom complet</label>
                <input
                  type="text"
                  placeholder="Nom et Prénom"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 outline-none transition"
                  required
                  value={regNomComplet}
                  onChange={e => setRegNomComplet(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Email</label>
                <input
                  type="email"
                  placeholder="nom.prenom@naftal.dz"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 outline-none transition"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Mot de passe</label>
                <input
                  type="password"
                  placeholder="Choisissez un mot de passe"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 outline-none transition"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-200">Département</label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 outline-none transition"
                  required
                  value={regDepartementId}
                  onChange={e => setRegDepartementId(e.target.value)}
                >
                  <option value="">Sélectionner un département</option>
                  <option value="11">Achats</option>
                  <option value="15">Administration Générale</option>
                  <option value="9">Commercial</option>
                  <option value="14">Direction Carburant</option>
                  <option value="13">Direction Technique</option>
                  <option value="5">Exploitation</option>
                  <option value="8">Finances</option>
                  <option value="2">Informatique</option>
                  <option value="1">Juridique</option>
                  <option value="3">Laboratoire</option>
                  <option value="6">Logistique</option>
                  <option value="12">Magasin</option>
                  <option value="4">Maintenance</option>
                  <option value="10">QHSE</option>
                  <option value="7">Ressources Humaines</option>
                  <option value="16">Transport</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-lg font-semibold text-lg bg-[#fa8800] text-white shadow-md transition hover:bg-[#e37400]"
                style={{ backgroundColor: orange }}
              >
                S'inscrire
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex justify-center mt-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Naftal. Pour assistance :{' '}
            <a
              href="mailto:support@naftal.dz"
              className="text-[#fa8800] hover:underline"
              style={{ color: orange }}
            >
              support@naftal.dz
            </a>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
