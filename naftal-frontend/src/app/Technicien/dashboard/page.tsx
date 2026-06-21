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
  employee_nom: string;
  departement_nom: string;
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

export default function TechnicienDashboard() {
  const [tech, setTech] = useState<any>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Status update form state
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/Technicien/authentification';
      return;
    }

    try {
      // 1. Fetch profile
      const profRes = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!profRes.ok) {
        localStorage.removeItem('token');
        window.location.href = '/Technicien/authentification';
        return;
      }
      const userData = await profRes.json();
      if (userData.role !== 'technicien') {
        window.location.href = '/';
        return;
      }
      setTech(userData);

      // 2. Fetch requests
      const reqRes = await fetch('http://localhost:5000/api/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData);
      }
    } catch (error) {
      console.error('Error fetching technician data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  const viewRequestDetails = async (reqId: number) => {
    const token = localStorage.getItem('token');
    setUpdateError('');
    setUpdateSuccess('');
    setComment('');
    setNewStatus('');
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${reqId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedRequest(data);
        setNewStatus(data.statut_actuel);
      }
    } catch (err) {
      console.error('Error loading request details:', err);
    }
  };

  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');

    if (!newStatus) {
      setUpdateError('Veuillez sélectionner un statut');
      return;
    }
    if (!comment.trim()) {
      setUpdateError('Le commentaire de suivi est obligatoire');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/requests/${selectedRequest.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ statut: newStatus, commentaire: comment })
      });

      const data = await res.json();
      if (res.ok) {
        setUpdateSuccess('Statut mis à jour avec succès !');
        setComment('');
        // Refresh details
        viewRequestDetails(selectedRequest.id);
        // Refresh main dashboard list
        fetchData();
      } else {
        setUpdateError(data.message || 'Erreur lors de la mise à jour.');
      }
    } catch {
      setUpdateError('Erreur réseau ou serveur');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#fa8800] border-t-transparent rounded-full animate-spin"></div>
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
          <h1 className="text-3xl font-extrabold text-[#fa8800] mb-1">Bienvenue, {tech?.nom_complet}</h1>
          <span className="text-gray-500 dark:text-gray-400 font-medium">Espace Technicien Spécialisé - Naftal</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow hover:bg-red-700 transition self-start md:self-center"
        >
          Se déconnecter
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column - info tech */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-fit">
          <h2 className="text-xl font-bold text-[#013468] dark:text-[#fa8800] mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            Mes Informations
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <span className="block text-xs text-gray-400 uppercase">Technicien</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{tech?.nom_complet}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase">Email professionnel</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{tech?.email}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase">Spécialité technique</span>
              <span className="font-bold text-[#013468] dark:text-blue-300">{tech?.specialite_nom || 'Non spécifiée'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase">Inscrit le</span>
              <span className="text-gray-500">
                {tech?.created_at ? new Date(tech.created_at).toLocaleDateString('fr-FR') : ''}
              </span>
            </div>
          </div>
        </section>

        {/* Right column - requests list */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Interventions assignées ({requests.length})</h2>

          {requests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
              <span className="text-5xl mb-4 block">✅</span>
              <h3 className="text-lg font-bold mb-2">Aucune intervention en cours</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Toutes les pannes qui vous ont été assignées ont été traitées ou aucune affectation n'a encore été effectuée par l'administrateur.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requests.map(req => (
                <motion.div
                  key={req.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
                  whileHover={{ y: -3 }}
                  onClick={() => viewRequestDetails(req.id)}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-orange-500/10 text-orange-600 dark:text-orange-300">
                        {req.type}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#013468] dark:text-[#fa8800] mb-1">
                      {req.marque} <span className="font-normal text-gray-500 dark:text-gray-400">{req.modele}</span>
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">N/S : {req.numero_serie}</p>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-sm mb-4 border border-gray-100 dark:border-gray-800">
                      <span className="block text-xs font-bold text-gray-400 mb-1">PROBLÈME :</span>
                      <p className="text-gray-700 dark:text-gray-300 italic line-clamp-2">
                        &ldquo;{req.description_probleme}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Demandé par :</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {req.employee_nom} ({req.departement_nom})
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">Statut actuel :</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(req.statut_actuel)}`}>
                        {req.statut_actuel}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* DETAILED ACTION MODAL */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              
              {/* Modal header */}
              <div className="flex justify-between items-center mb-6 pb-2 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-[#013468] dark:text-[#fa8800]">
                    Suivi Technique : {selectedRequest.type} {selectedRequest.marque}
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusColor(selectedRequest.statut_actuel)}`}>
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

              {/* Grid split: details/timeline vs actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Info & Actions (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-gray-400 block text-xs">Demandeur</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedRequest.employee_nom} ({selectedRequest.departement_nom})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Email demandeur</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-400">{selectedRequest.employee_email}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Modèle / Série</span>
                      <span className="font-semibold">{selectedRequest.modele} | {selectedRequest.numero_serie}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">Priorité de traitement</span>
                      <span className="font-bold text-red-600">{selectedRequest.priority}</span>
                    </div>
                    <div className="col-span-2 border-t border-gray-200 dark:border-gray-800 pt-2">
                      <span className="text-gray-400 block text-xs">Panne déclarée</span>
                      <span className="italic block mt-1 text-gray-700 dark:text-gray-300">
                        &ldquo;{selectedRequest.description_probleme}&rdquo;
                      </span>
                    </div>
                  </div>

                  {/* Form to update status */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm">
                    <h4 className="font-bold text-lg text-[#fa8800] mb-4">Mettre à jour le statut</h4>
                    
                    {updateError && <div className="p-3 mb-4 bg-red-50 text-red-700 border border-red-200 rounded text-sm">{updateError}</div>}
                    {updateSuccess && <div className="p-3 mb-4 bg-green-50 text-green-700 border border-green-200 rounded text-sm">{updateSuccess}</div>}

                    <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Étape du processus</label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                          value={newStatus}
                          onChange={e => setNewStatus(e.target.value)}
                          required
                        >
                          <option value="Pris en charge">Pris en charge (Accepté)</option>
                          <option value="Diagnostic">Diagnostic en cours</option>
                          <option value="Attente de pièces">En attente de pièces de rechange</option>
                          <option value="Réparation en cours">Réparation en cours</option>
                          <option value="Réparé">Réparé (Terminé & Prêt)</option>
                          <option value="Rendu">Restitué / Rendu à l'employé</option>
                          <option value="Clôturé">Clôturé (Finalisé)</option>
                          <option value="Non réparable">Non réparable / Refusé</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Commentaire de suivi (obligatoire)</label>
                        <textarea
                          placeholder="Décrivez les actions effectuées lors de cette étape (pièces changées, observations, etc.)..."
                          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 h-24 text-sm"
                          required
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="bg-[#fa8800] text-white px-5 py-2 rounded-lg font-bold hover:bg-[#e37400] transition text-sm"
                      >
                        Enregistrer la mise à jour
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Side: Timeline History (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="font-bold text-lg text-[#013468] dark:text-[#fa8800]">Historique de suivi</h4>

                  {(!selectedRequest.history || selectedRequest.history.length === 0) ? (
                    <p className="text-sm text-gray-500">Aucun historique disponible.</p>
                  ) : (
                    <div className="max-h-[450px] overflow-y-auto pr-2 relative border-l-2 border-orange-500 dark:border-slate-700 ml-3 space-y-4">
                      {selectedRequest.history.map((hist: HistoryItem) => (
                        <div key={hist.id} className="relative pl-6">
                          {/* Dot indicator */}
                          <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#fa8800] border-2 border-white dark:border-gray-800 shadow"></div>
                          
                          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 shadow-sm text-xs">
                            <div className="flex justify-between items-center mb-1 gap-2">
                              <span className={`font-bold px-2 py-0.5 rounded-full ${getStatusColor(hist.statut)}`}>
                                {hist.statut}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(hist.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 italic mb-1">
                              &ldquo;{hist.commentaire}&rdquo;
                            </p>
                            <span className="text-[10px] text-gray-400 block">
                              Par : <span className="font-semibold">{hist.changed_by_nom}</span> ({hist.changed_by_role === 'employe' ? 'Employé' : hist.changed_by_role === 'technicien' ? 'Technicien' : 'Admin'})
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
