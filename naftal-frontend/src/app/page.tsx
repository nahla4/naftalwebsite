'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Wrench, 
  CircleCheckBig, 
  Clock3, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  FileSearch, 
  BellRing,
  Cog
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "Déclaration rapide",
      text: "Les employés signalent un matériel à réparer avec toutes les informations nécessaires."
    },
    {
      icon: <FileSearch className="w-6 h-6" />,
      title: "Suivi en temps réel",
      text: "Chaque demande avance étape par étape avec un historique clair et daté."
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "Gestion technicien",
      text: "Les techniciens prennent en charge, diagnostiquent et finalisent les réparations."
    },
    {
      icon: <BellRing className="w-6 h-6" />,
      title: "Notifications",
      text: "Le système informe les utilisateurs lors des changements de statut importants."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Accès sécurisé",
      text: "Chaque utilisateur accède uniquement à son espace selon son rôle."
    },
    {
      icon: <Cog className="w-6 h-6" />,
      title: "Workflow structuré",
      text: "Le processus suit des étapes claires : dépôt, prise en charge, réparation, retour."
    },
  ];

  const steps = [
    "L’employé crée une demande de réparation.",
    "Le technicien reçoit et analyse le matériel.",
    "Le statut évolue à chaque étape du traitement.",
    "L’employé suit l’avancement jusqu’au retour du matériel."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-16">
        
        {/* Hero */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 mb-6">
              <CircleCheckBig className="w-4 h-4" />
              Plateforme officielle Naftal
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Gestion intelligente du matériel à réparer
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
              Une plateforme moderne pour déclarer, suivre et traiter les demandes de réparation
              avec un workflow clair pour les employés et les techniciens.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="/Employe/authentification"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#fa8800] text-white font-semibold text-lg shadow-lg hover:bg-[#e37400] transition-all hover:scale-[1.02]"
              >
                Accéder à l’espace Employé
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="/Technicien/authentification"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-[#013468] text-[#013468] dark:text-white dark:border-blue-400 font-semibold text-lg shadow-lg hover:bg-[#013468] hover:text-white transition-all hover:scale-[1.02]"
              >
                Accéder à l’espace Technicien
              </a>
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-md border border-gray-100 dark:border-gray-800">
                <Users className="w-6 h-6 text-[#fa8800] mb-2" />
                <p className="font-semibold">Comptes séparés</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Employés et techniciens</p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-md border border-gray-100 dark:border-gray-800">
                <Clock3 className="w-6 h-6 text-[#fa8800] mb-2" />
                <p className="font-semibold">Suivi daté</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Historique complet</p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-md border border-gray-100 dark:border-gray-800">
                <ShieldCheck className="w-6 h-6 text-[#fa8800] mb-2" />
                <p className="font-semibold">Accès sécurisé</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Par rôle utilisateur</p>
              </div>
            </div>
          </div>

          {/* Visual illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#fa8800]/20 to-[#013468]/20 rounded-[2rem] blur-3xl" />
            <div className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Vue globale de la plateforme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Workflow de réparation Naftal</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-[#fa8800]">
                  <Wrench className="w-7 h-7" />
                </div>
              </div>

              <div className="p-6 grid gap-4">
                {[
                  { label: "1. Demande déposée", color: "bg-blue-500" },
                  { label: "2. Prise en charge", color: "bg-orange-500" },
                  { label: "3. Réparation", color: "bg-amber-500" },
                  { label: "4. Retour matériel", color: "bg-green-500" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                    <div className={`w-12 h-12 rounded-xl ${item.color} text-white flex items-center justify-center font-bold`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.label}</p>
                      <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full ${item.color}`}
                          style={{ width: `${(index + 1) * 25}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* About */}
        <section className="mt-20 grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Ce que fait la plateforme</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Cette application centralise la gestion du matériel endommagé, depuis la déclaration
              initiale jusqu’à la restitution après réparation. Elle améliore la traçabilité,
              réduit les oublis, et permet à chaque acteur de suivre exactement l’état du dossier.
            </p>

            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#fa8800] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#fa8800] flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Highlight strip */}
        <section className="mt-20 bg-gradient-to-r from-[#013468] to-[#fa8800] text-white rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm uppercase tracking-widest opacity-80">Objectif</p>
              <p className="text-xl font-bold mt-2">Rendre le suivi simple et professionnel</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest opacity-80">Avantage</p>
              <p className="text-xl font-bold mt-2">Chaque action est enregistrée et visible</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest opacity-80">Résultat</p>
              <p className="text-xl font-bold mt-2">Une meilleure organisation du service</p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-20 grid lg:grid-cols-2 gap-8">
          <div className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Support & contact</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Pour toute question ou assistance, contactez le support technique.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              📧{" "}
              <a
                href="mailto:support@naftal.dz"
                className="text-[#fa8800] hover:underline font-medium"
              >
                support@naftal.dz
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              Naftal - Branche Carburants, Dar El Beïda, Alger, Algérie
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Résumé visuel</h2>
            <div className="space-y-4">
              {[
                "Déclaration du matériel",
                "Affectation au technicien",
                "Réparation et suivi",
                "Retour et clôture"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#fa8800]" />
                  <p className="text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="text-center py-10 text-gray-500 dark:text-gray-400 select-none">
          &copy; {new Date().getFullYear()} Naftal. Tous droits réservés.
        </footer>
      </div>
    </div>
  );
}