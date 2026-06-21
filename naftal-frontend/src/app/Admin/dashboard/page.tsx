'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const orange = '#fa8800';
const blue = '#013468';

interface RequestItem {
  id: number;
  type: string;
  marque: string;
  modele: string;
  numero_serie: string;
  description_probleme: string;
  priority: string;
  statut_actuel: string;
  employee_id: number;
  employee_nom: string;
  employee_email: string;
  departement_nom: string;
  technicien_id: number | null;
  technicien_nom: string | null;
  created_at: string;
}

interface TechItem {
  id: number;
  nom_complet: string;
  email: string;
  specialite_nom: string;
}

interface UserItem {
  id: number;
  nom_complet: string;
  email: string;
  role: string;
  created_at: string;
  departement_nom: string | null;
  specialite_nom: string | null;
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [technicians, setTechnicians] = useState<TechItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'requests' | 'users'>('stats');
  
  // Selected request details modal
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Temporary assignments dropdown state
  const [assignments, setAssignments] = useState<{ [reqId: number]: string }>({});

  // Feedback notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/Admin/authentification';
      return;
    }

    try {
      // 1. Fetch profile
      const profRes = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!profRes.ok) {
        localStorage.removeItem('token');
        window.location.href = '/Admin/authentification';
        return;
      }
      const userData = await profRes.json();
      if (userData.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setAdmin(userData);

      // 2. Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 3. Fetch requests
      const reqRes = await fetch('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }

      // 4. Fetch technicians
      const techRes = await fetch('http://localhost:5000/api/admin/technicians', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (techRes.ok) {
        const techData = await techRes.json();
        setTechnicians(techData);
      }

      // 5. Fetch users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setErrorMsg('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  const handleAssignTechnician = async (reqId: number) => {
    setSuccessMsg('');
    setErrorMsg('');
    const techId = assignments[reqId];

    if (!techId) {
      setErrorMsg('Veuillez sélectionner un technicien avant d\'assigner.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/requests/${reqId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ technicien_id: Number(techId) })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Technicien assigné avec succès !`);
        // Refresh dashboard data
        fetchData();
      } else {
        setErrorMsg(data.message || 'Erreur lors de l\'affectation.');
      }
    } catch {
      setErrorMsg('Erreur réseau ou serveur');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Compte utilisateur supprimé avec succès.');
        fetchData();
      } else {
        setErrorMsg(data.message || 'Erreur lors de la suppression.');
      }
    } catch {
      setErrorMsg('Erreur réseau ou serveur');
    }
  };

  const viewRequestDetails = async (reqId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${reqId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedRequest(data);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En attente de réponse': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Pris en charge': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Diagnostic': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Attente de pièces': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Réparation en cours': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Réparé': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Rendu': return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'Clôturé': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'Non réparable': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'Faible': return 'text-green-600 bg-green-50';
      case 'Moyenne': return 'text-yellow-600 bg-yellow-50';
      case 'Elevee': return 'text-orange-600 bg-orange-50';
      case 'Urgente': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-6 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-orange-500 mb-1">Espace Administration</h1>
          <span className="text-slate-400 font-medium">Portail Naftfix de Gestion Globale</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow hover:bg-red-700 transition self-start md:self-center"
        >
          Se déconnecter
        </button>
      </header>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 mb-6 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-xl font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 mb-6 bg-red-950/80 border border-red-800 text-red-400 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 mb-8 gap-4 overflow-x-auto pb-1">
        <button
          className={`px-5 py-3 font-semibold transition border-b-2 text-sm whitespace-nowrap ${
            activeTab === 'stats' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Vue d'ensemble (KPIs)
        </button>
        <button
          className={`px-5 py-3 font-semibold transition border-b-2 text-sm whitespace-nowrap ${
            activeTab === 'requests' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          🛠️ Demandes de réparation ({requests.length})
        </button>
        <button
          className={`px-5 py-3 font-semibold transition border-b-2 text-sm whitespace-nowrap ${
            activeTab === 'users' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('users')}
        >
          👥 Gestion des Utilisateurs ({users.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'stats' && (
          <motion.div
            key="stats-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <span className="text-slate-400 font-medium text-sm">Demandes déclarées</span>
                <span className="text-4xl font-extrabold text-orange-500 mt-2">{stats?.total_requests || 0}</span>
                <span className="text-xs text-slate-500 mt-4">Total historique cumulé</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <span className="text-slate-400 font-medium text-sm">Employés enregistrés</span>
                <span className="text-4xl font-extrabold text-[#fa8800] mt-2">{stats?.total_employees || 0}</span>
                <span className="text-xs text-slate-500 mt-4">Comptes émetteurs</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <span className="text-slate-400 font-medium text-sm">Techniciens qualifiés</span>
                <span className="text-4xl font-extrabold text-blue-400 mt-2">{stats?.total_technicians || 0}</span>
                <span className="text-xs text-slate-500 mt-4">Spécialistes actifs</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                <span className="text-slate-400 font-medium text-sm">En attente d'affectation</span>
                <span className="text-4xl font-extrabold text-yellow-500 mt-2">
                  {stats?.by_status?.['En attente de réponse'] || 0}
                </span>
                <span className="text-xs text-slate-500 mt-4">Demandes sans technicien</span>
              </div>
            </div>

            {/* Breakdown charts (using simple pure HTML styling) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Status Breakdown list */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-slate-100 mb-6">Répartition par État</h3>
                <div className="space-y-4">
                  {Object.entries(stats?.by_status || {}).map(([status, count]: [string, any]) => (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-300">{status}</span>
                        <span className="font-bold text-orange-500">{count}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (count / (stats?.total_requests || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {Object.keys(stats?.by_status || {}).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">Aucune donnée disponible</p>
                  )}
                </div>
              </div>

              {/* Priority Breakdown list */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-slate-100 mb-6">Répartition par Priorité</h3>
                <div className="space-y-4">
                  {Object.entries(stats?.by_priority || {}).map(([prio, count]: [string, any]) => {
                    const barColor = prio === 'Urgente' ? 'bg-red-600' : prio === 'Elevee' ? 'bg-orange-500' : prio === 'Moyenne' ? 'bg-yellow-500' : 'bg-green-500';
                    return (
                      <div key={prio} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-slate-300">{prio}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className={`${barColor} h-2 rounded-full`}
                            style={{ width: `${Math.min(100, (count / (stats?.total_requests || 1)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(stats?.by_priority || {}).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">Aucune donnée disponible</p>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: REPAIR REQUESTS & TECHNICAL ASSIGNMENTS */}
        {activeTab === 'requests' && (
          <motion.div
            key="requests-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {requests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl">
                <span className="text-5xl block mb-4">📦</span>
                <p className="text-slate-400 font-medium">Aucune demande de réparation enregistrée pour le moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Matériel</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Demandeur</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Priorité</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Technicien en charge</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-900/60 transition duration-150">
                        {/* Material Info */}
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => viewRequestDetails(req.id)}>
                          <div className="font-bold text-orange-500">{req.type}</div>
                          <div className="text-slate-300 text-xs font-semibold">{req.marque} {req.modele}</div>
                          <div className="text-slate-500 text-[10px]">S/N: {req.numero_serie}</div>
                        </td>
                        {/* Employee requester */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold">{req.employee_nom}</div>
                          <div className="text-slate-400 text-xs">{req.departement_nom}</div>
                        </td>
                        {/* Priority */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${getPriorityColor(req.priority)}`}>
                            {req.priority}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(req.statut_actuel)}`}>
                            {req.statut_actuel}
                          </span>
                        </td>
                        {/* Assigned Technician / Assignment controls */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {req.technicien_nom ? (
                            <span className="text-sm font-bold text-blue-400">🔧 {req.technicien_nom}</span>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <select
                                className="bg-slate-800 text-white text-xs rounded border border-slate-700 p-1.5 focus:outline-none focus:border-orange-500 w-44"
                                value={assignments[req.id] || ''}
                                onChange={e => setAssignments({ ...assignments, [req.id]: e.target.value })}
                              >
                                <option value="">Choisir un technicien</option>
                                {technicians.map(tech => (
                                  <option key={tech.id} value={tech.id}>
                                    {tech.nom_complet} ({tech.specialite_nom})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssignTechnician(req.id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-2.5 py-1.5 rounded transition"
                              >
                                Assigner
                              </button>
                            </div>
                          )}
                        </td>
                        {/* View history action button */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => viewRequestDetails(req.id)}
                            className="bg-[#013468] hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                          >
                            Timeline & Suivi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {users.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-2xl">
                <span className="text-5xl block mb-4">👥</span>
                <p className="text-slate-400 font-medium">Aucun compte utilisateur trouvé.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-950">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rôle</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Département / Spécialité</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Inscrit le</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-900/60 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap font-bold">{u.nom_complet}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            u.role === 'technicien' ? 'bg-blue-900/40 text-blue-300 border border-blue-800' : 'bg-amber-900/40 text-amber-300 border border-amber-800'
                          }`}>
                            {u.role === 'technicien' ? 'Technicien' : 'Employé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">
                          {u.role === 'employe' ? (
                            <span className="text-orange-400 font-semibold">{u.departement_nom || '-'}</span>
                          ) : (
                            <span className="text-blue-400 font-semibold">{u.specialite_nom || '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="bg-red-950 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Supprimer le compte
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* REQUEST TIMELINE & HISTORY MODAL */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              
              {/* Modal header */}
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-orange-500">
                    Suivi : {selectedRequest.type} {selectedRequest.marque}
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(selectedRequest.statut_actuel)}`}>
                    {selectedRequest.statut_actuel}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              {/* Request content */}
              <div className="space-y-6">
                
                {/* Details layout */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl text-sm border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-xs">Employé demandeur</span>
                    <span className="font-semibold text-slate-200">{selectedRequest.employee_nom} ({selectedRequest.departement_nom})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Email demandeur</span>
                    <span className="font-mono text-slate-400">{selectedRequest.employee_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Modèle / Série</span>
                    <span className="font-semibold">{selectedRequest.modele} | {selectedRequest.numero_serie}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Date de dépôt</span>
                    <span className="font-semibold">
                      {new Date(selectedRequest.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-xs">Panne signalée</span>
                    <span className="italic block mt-1 text-slate-300">
                      &ldquo;{selectedRequest.description_probleme}&rdquo;
                    </span>
                  </div>
                  {selectedRequest.technicien_nom && (
                    <div className="col-span-2 border-t border-slate-800 pt-2">
                      <span className="text-slate-500 block text-xs">Technicien assigné</span>
                      <span className="font-bold text-blue-400">
                        {selectedRequest.technicien_nom} ({selectedRequest.technicien_email})
                      </span>
                    </div>
                  )}
                </div>

                {/* Timeline status history list */}
                <div>
                  <h4 className="font-bold text-lg text-orange-500 mb-4">Historique des actions</h4>
                  
                  {(!selectedRequest.history || selectedRequest.history.length === 0) ? (
                    <p className="text-sm text-slate-500">Aucun historique disponible.</p>
                  ) : (
                    <div className="relative border-l-2 border-orange-500/40 ml-3 space-y-6">
                      {selectedRequest.history.map((hist: any) => (
                        <div key={hist.id} className="relative pl-6">
                          
                          {/* Circle indicator */}
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-slate-900 shadow"></div>
                          
                          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 shadow-sm text-xs">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-2">
                              <span className={`font-bold px-2 py-0.5 rounded-full w-fit ${getStatusColor(hist.statut)}`}>
                                {hist.statut}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(hist.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 font-medium mb-1">&ldquo;{hist.commentaire}&rdquo;</p>
                            <span className="text-[10px] text-slate-500 block">
                              Par : <span className="font-semibold text-slate-400">{hist.changed_by_nom}</span> ({hist.changed_by_role === 'employe' ? 'Employé' : hist.changed_by_role === 'technicien' ? 'Technicien' : 'Administrateur'})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Close footer */}
              <div className="flex justify-end pt-4 border-t border-slate-800 mt-6">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  Fermer
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
