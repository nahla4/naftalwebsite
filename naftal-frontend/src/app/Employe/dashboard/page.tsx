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
  technicien_nom: string | null;
  created_at: string;
  updated_at: string;
}

interface HistoryItem {
  id: number;
  statut: string;
  commentaire: string;
  created_at: string;
  changed_by_nom: string;
  changed_by_role: string;
}

export default function EmployeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [editNom, setEditNom] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Declare request state
  const [newType, setNewType] = useState('');
  const [newMarque, setNewMarque] = useState('');
  const [newModele, setNewModele] = useState('');
  const [newSerie, setNewSerie] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newPriority, setNewPriority] = useState('Moyenne');

  // Feedback alerts
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackErr, setFeedbackErr] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/Employe/authentification';
      return;
    }

    try {
      // 1. Fetch profile
      const profRes = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!profRes.ok) {
        localStorage.removeItem('token');
        window.location.href = '/Employe/authentification';
        return;
      }
      const userData = await profRes.json();
      if (userData.role !== 'employe') {
        window.location.href = '/';
        return;
      }
      setUser(userData);
      setEditNom(userData.nom_complet);
      setEditEmail(userData.email);

      // 2. Fetch requests
      const reqRes = await fetch('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setFeedbackErr('Impossible de charger les données. Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg('');
    setFeedbackErr('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nom_complet: editNom, email: editEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg('Profil mis à jour !');
        setEditMode(false);
        fetchData();
        window.dispatchEvent(new Event('auth-change'));
      } else {
        setFeedbackErr(data.message || 'Erreur lors de la mise à jour.');
      }
    } catch {
      setFeedbackErr('Erreur réseau ou serveur');
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg('');
    setFeedbackErr('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: newType,
          marque: newMarque,
          modele: newModele,
          numero_serie: newSerie,
          description_probleme: newProblem,
          priority: newPriority
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg('Matériel déclaré avec succès !');
        setShowAddModal(false);
        // Clear inputs
        setNewType('');
        setNewMarque('');
        setNewModele('');
        setNewSerie('');
        setNewProblem('');
        setNewPriority('Moyenne');
        // Refresh requests list
        fetchData();
      } else {
        setFeedbackErr(data.message || 'Erreur lors du dépôt.');
      }
    } catch {
      setFeedbackErr('Erreur réseau ou serveur');
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
      console.error('Error fetching request details:', err);
    }
  };

  // Helper to color status badges
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 sm:p-10 font-sans">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#fa8800] mb-1">Bienvenue, {user?.nom_complet}</h1>
          <span className="text-gray-500 dark:text-gray-400 font-medium">Espace Personnel Employé - Naftal</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow hover:bg-red-700 transition self-start md:self-center"
        >
          Se déconnecter
        </button>
      </header>

      {/* Main Alert notifications */}
      {feedbackMsg && (
        <div className="p-4 mb-6 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl font-medium">
          {feedbackMsg}
        </div>
      )}
      {feedbackErr && (
        <div className="p-4 mb-6 bg-red-100 border border-red-300 text-red-800 rounded-xl font-medium">
          {feedbackErr}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-fit">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-[#013468] dark:text-[#fa8800]">Mon Profil</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs bg-[#013468] text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition"
              >
                Modifier
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nom complet</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 mt-1"
                  value={editNom}
                  onChange={e => setEditNom(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 mt-1"
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <button type="submit" className="bg-[#fa8800] text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 text-sm">
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm"
                  onClick={() => {
                    setEditMode(false);
                    setEditNom(user?.nom_complet);
                    setEditEmail(user?.email);
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-gray-400 uppercase">Nom Complet</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.nom_complet}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 uppercase">Email</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{user?.email}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 uppercase">Département</span>
                <span className="font-semibold text-orange-600">{user?.departement_nom || 'Non spécifié'}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 uppercase">Date d'inscription</span>
                <span className="text-gray-500 text-sm">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : ''}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Right Columns: Requests List */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mes Demandes de Réparation</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#fa8800] text-white px-5 py-2.5 rounded-xl font-bold shadow hover:bg-orange-600 transition flex items-center gap-2"
            >
              <span>+</span> Déclarer un matériel
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
              <span className="text-5xl mb-4 block">📦</span>
              <h3 className="text-lg font-bold mb-2">Aucun matériel signalé</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                Vous n'avez actuellement aucun matériel déposé pour réparation. Utilisez le bouton ci-dessus pour déclarer une panne.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map(req => (
                <motion.div
                  key={req.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-t-4 border-[#013468] hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                  whileHover={{ y: -3 }}
                  onClick={() => viewRequestDetails(req.id)}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#013468]/10 text-[#013468] dark:text-blue-300">
                        {req.type}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#fa8800] mb-1">
                      {req.marque} <span className="font-normal text-gray-600 dark:text-gray-400">{req.modele}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">N/S : {req.numero_serie}</p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 italic">
                      &ldquo;{req.description_probleme}&rdquo;
                    </p>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Statut :</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(req.statut_actuel)}`}>
                        {req.statut_actuel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Technicien :</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-400">
                        {req.technicien_nom || 'Non assigné'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MODAL 1: ADD REQUEST */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6 pb-2 border-b dark:border-gray-700">
                <h3 className="text-2xl font-bold text-[#013468] dark:text-[#fa8800]">Déclarer un matériel à réparer</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type de matériel</label>
                    <input
                      type="text"
                      placeholder="ex: Imprimante, PC portable"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      required
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Marque</label>
                    <input
                      type="text"
                      placeholder="ex: HP, Dell, Cummins"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      required
                      value={newMarque}
                      onChange={e => setNewMarque(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Modèle</label>
                    <input
                      type="text"
                      placeholder="ex: LaserJet Pro"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      required
                      value={newModele}
                      onChange={e => setNewModele(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Numéro de série</label>
                    <input
                      type="text"
                      placeholder="ex: SN-987654"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                      required
                      value={newSerie}
                      onChange={e => setNewSerie(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priorité</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                  >
                    <option value="Faible">Faible (Non critique)</option>
                    <option value="Moyenne">Moyenne (Standard)</option>
                    <option value="Elevee">Élevée (Important)</option>
                    <option value="Urgente">Urgente (Bloquant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description détaillée de la panne</label>
                  <textarea
                    placeholder="Décrivez précisément les symptômes du problème..."
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 h-28"
                    required
                    value={newProblem}
                    onChange={e => setNewProblem(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    type="submit"
                    className="bg-[#fa8800] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition"
                  >
                    Soumettre la demande
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 dark:bg-gray-700 px-6 py-2.5 rounded-lg text-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: REQUEST DETAILS & TIMELINE HISTORY */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6 pb-2 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#013468] dark:text-[#fa8800]">
                    Suivi : {selectedRequest.type} {selectedRequest.marque}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(selectedRequest.statut_actuel)}`}>
                    {selectedRequest.statut_actuel}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm border border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-gray-400 block text-xs">Modèle</span>
                    <span className="font-semibold">{selectedRequest.modele}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Numéro de série</span>
                    <span className="font-mono font-semibold">{selectedRequest.numero_serie}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Priorité de l'intervention</span>
                    <span className="font-semibold">{selectedRequest.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs">Déposé le</span>
                    <span className="font-semibold">
                      {new Date(selectedRequest.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-xs">Panne signalée</span>
                    <span className="italic block mt-0.5 text-gray-700 dark:text-gray-300">
                      &ldquo;{selectedRequest.description_probleme}&rdquo;
                    </span>
                  </div>
                  {selectedRequest.technicien_nom && (
                    <div className="col-span-2 border-t border-gray-200 dark:border-gray-800 pt-2">
                      <span className="text-gray-400 block text-xs">Technicien en charge</span>
                      <span className="font-semibold text-blue-900 dark:text-blue-300">
                        {selectedRequest.technicien_nom} ({selectedRequest.technicien_email})
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Timeline History */}
                <div>
                  <h4 className="font-bold text-lg text-[#013468] dark:text-[#fa8800] mb-4">Historique des actions</h4>
                  
                  {(!selectedRequest.history || selectedRequest.history.length === 0) ? (
                    <p className="text-sm text-gray-500">Aucun historique disponible.</p>
                  ) : (
                    <div className="relative border-l-2 border-orange-500 dark:border-slate-700 ml-3 space-y-6">
                      {selectedRequest.history.map((hist: HistoryItem) => (
                        <div key={hist.id} className="relative pl-6">
                          
                          {/* Dot indicator */}
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#fa8800] border-2 border-white dark:border-gray-800 shadow"></div>
                          
                          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${getStatusColor(hist.statut)}`}>
                                {hist.statut}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(hist.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">&ldquo;{hist.commentaire}&rdquo;</p>
                            <span className="text-xs text-blue-900 dark:text-slate-400 block">
                              Par : <span className="font-semibold">{hist.changed_by_nom}</span> ({hist.changed_by_role === 'employe' ? 'Employé' : hist.changed_by_role === 'technicien' ? 'Technicien' : 'Administrateur'})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t dark:border-gray-700 mt-6">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="bg-gray-200 dark:bg-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold"
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
