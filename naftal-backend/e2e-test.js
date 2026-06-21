// Full E2E test via API
const pool = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');

const BASE = 'http://localhost:5000';

async function fetchJSON(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { status: res.status, ok: res.ok, data: json };
  } catch {
    return { status: res.status, ok: res.ok, data: text };
  }
}

async function post(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetchJSON(url, { method: 'POST', headers, body: JSON.stringify(body) });
}

async function put(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetchJSON(url, { method: 'PUT', headers, body: JSON.stringify(body) });
}

async function get(url, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetchJSON(url, { method: 'GET', headers });
}

async function run() {
  console.log('\n===== NAFTFIX END-TO-END API TEST =====\n');

  // 1. Admin Login
  console.log('[1] Admin Login...');
  const adminLogin = await post(`${BASE}/api/auth/admin/login`, { email: 'admin@naftal.dz', password: 'Admin@Naftal2024' });
  if (!adminLogin.ok) { console.error('Admin login failed:', adminLogin.data); process.exit(1); }
  const adminToken = adminLogin.data.token;
  console.log('   ✅ Admin logged in');

  // 2. Register Technician
  console.log('[2] Register Technician...');
  let techToken;
  const techReg = await post(`${BASE}/api/auth/technicien/register`, {
    nom_complet: 'Sofiane Mahdi',
    email: 'sofiane.mahdi@naftal.dz',
    password: 'Tech@2024',
    specialite_id: 1
  });
  if (techReg.status === 400 && techReg.data.message && techReg.data.message.includes('déjà utilisé')) {
    console.log('   ⚠️  Technician already exists, logging in...');
  } else if (!techReg.ok) {
    console.error('Tech reg failed:', techReg.data);
    process.exit(1);
  } else {
    console.log('   ✅ Technician registered');
  }
  
  // 3. Technician Login
  console.log('[3] Technician Login...');
  const techLogin = await post(`${BASE}/api/auth/technicien/login`, { email: 'sofiane.mahdi@naftal.dz', password: 'Tech@2024' });
  if (!techLogin.ok) { console.error('Tech login failed:', techLogin.data); process.exit(1); }
  techToken = techLogin.data.token;
  console.log('   ✅ Technician logged in');

  // 4. Employee Login
  console.log('[4] Employee Login...');
  const empLogin = await post(`${BASE}/api/auth/employe/login`, { email: 'karim.hamidi@naftal.dz', password: 'Karim@2024' });
  if (!empLogin.ok) { console.error('Emp login failed:', empLogin.data); process.exit(1); }
  const empToken = empLogin.data.token;
  console.log('   ✅ Employee logged in');

  // 5. Employee creates a repair request
  console.log('[5] Creating Repair Request...');
  const createReq = await post(`${BASE}/api/requests`, {
    type: 'Ordinateur portable',
    marque: 'Dell',
    modele: 'Latitude 5410',
    numero_serie: 'SN-DELL-001',
    description_probleme: "L'écran ne s'allume pas au démarrage, le système ne démarre pas.",
    priority: 'Elevee'
  }, empToken);
  if (!createReq.ok) { console.error('Create request failed:', createReq.data); process.exit(1); }
  const requestId = createReq.data.requestId;
  console.log(`   ✅ Request created with ID: ${requestId}`);

  // 6. Get technician ID
  const [techUsers] = await pool.query("SELECT id FROM users WHERE email = 'sofiane.mahdi@naftal.dz'");
  const techId = techUsers[0].id;

  // 7. Admin assigns technician
  console.log('[6] Admin Assigns Technician...');
  const assign = await put(`${BASE}/api/admin/requests/${requestId}/assign`, { technicien_id: techId }, adminToken);
  if (!assign.ok) { console.error('Assign failed:', assign.data); process.exit(1); }
  console.log(`   ✅ Technician (ID: ${techId}) assigned to request ${requestId}`);

  // 8. Technician updates status through workflow
  const statusSteps = [
    { statut: 'Diagnostic', commentaire: 'Diagnostic effectué : carte graphique défaillante détectée.' },
    { statut: 'Attente de pièces', commentaire: 'Commande de la carte graphique de remplacement passée.' },
    { statut: 'Réparation en cours', commentaire: 'Remplacement de la carte graphique en cours.' },
    { statut: 'Réparé', commentaire: 'Remplacement effectué avec succès. Appareil fonctionnel.' },
    { statut: 'Rendu', commentaire: 'Matériel restitué à l\'employé.' },
  ];

  console.log('[7] Technician Updates Status Through Workflow...');
  for (const step of statusSteps) {
    const update = await put(`${BASE}/api/requests/${requestId}/status`, step, techToken);
    if (!update.ok) { console.error(`Status update (${step.statut}) failed:`, update.data); process.exit(1); }
    console.log(`   ✅ Status -> ${step.statut}`);
  }

  // 9. Admin closes the request
  console.log('[8] Admin Closes Request...');
  const close = await put(`${BASE}/api/requests/${requestId}/status`, {
    statut: 'Clôturé',
    commentaire: 'Dossier finalisé et archivé par l\'administrateur.'
  }, adminToken);
  if (!close.ok) { console.error('Close failed:', close.data); process.exit(1); }
  console.log('   ✅ Request closed');

  // 10. Employee views history
  console.log('[9] Employee Views Full History...');
  const details = await get(`${BASE}/api/requests/${requestId}`, empToken);
  if (!details.ok) { console.error('Get details failed:', details.data); process.exit(1); }
  console.log(`   ✅ History loaded - ${details.data.history.length} entries:`);
  details.data.history.forEach((h, i) => {
    console.log(`      ${i+1}. [${h.statut}] by ${h.changed_by_nom} - "${h.commentaire.substring(0, 50)}..."`);
  });

  console.log('\n===== ALL TESTS PASSED ✅ =====\n');
  console.log('📋 Credentials Summary:');
  console.log('   Admin:      admin@naftal.dz / Admin@Naftal2024');
  console.log('   Employee:   karim.hamidi@naftal.dz / Karim@2024');
  console.log('   Technician: sofiane.mahdi@naftal.dz / Tech@2024');
  console.log('');
  process.exit(0);
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
