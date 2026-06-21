const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 1. Create a repair request (Employees only)
router.post('/', authenticateToken, requireRole(['employe', 'admin']), async (req, res) => {
  const { type, marque, modele, numero_serie, description_probleme, priority } = req.body;

  if (!type || !marque || !modele || !numero_serie || !description_probleme) {
    return res.status(400).json({ message: 'Veuillez remplir tous les détails du matériel et du problème' });
  }

  // Determine employee ID (either logged in user, or from request if admin wants to submit)
  const employeeId = req.user.id;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert material first
    const [matResult] = await connection.query(
      'INSERT INTO materials (type, marque, modele, numero_serie) VALUES (?, ?, ?, ?)',
      [type, marque, modele, numero_serie]
    );
    const materialId = matResult.insertId;

    // Insert repair request
    const chosenPriority = priority || 'Moyenne';
    const [reqResult] = await connection.query(
      'INSERT INTO repair_requests (employee_id, material_id, description_probleme, priority, statut_actuel) VALUES (?, ?, ?, ?, ?)',
      [employeeId, materialId, description_probleme, chosenPriority, 'En attente de réponse']
    );
    const requestId = reqResult.insertId;

    // Insert initial status history
    await connection.query(
      'INSERT INTO status_history (request_id, statut, commentaire, changed_by_id) VALUES (?, ?, ?, ?)',
      [requestId, 'En attente de réponse', 'Demande de réparation déclarée par l\'employé', employeeId]
    );

    await connection.commit();
    res.status(201).json({ message: 'Demande créée avec succès', requestId });
  } catch (error) {
    await connection.rollback();
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la demande', error: error.message });
  } finally {
    connection.release();
  }
});

// 2. Get repair requests (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  const { role, id: userId } = req.user;

  try {
    let query = `
      SELECT r.id, r.employee_id, r.material_id, r.description_probleme, r.priority, r.statut_actuel, r.technicien_id, r.created_at, r.updated_at,
             m.type, m.marque, m.modele, m.numero_serie,
             u_emp.nom_complet AS employee_nom, u_emp.email AS employee_email,
             d.nom AS departement_nom,
             u_tech.nom_complet AS technicien_nom
      FROM repair_requests r
      JOIN materials m ON r.material_id = m.id
      JOIN users u_emp ON r.employee_id = u_emp.id
      LEFT JOIN departments d ON u_emp.departement_id = d.id
      LEFT JOIN users u_tech ON r.technicien_id = u_tech.id
    `;
    let params = [];

    if (role === 'employe') {
      query += ' WHERE r.employee_id = ?';
      params.push(userId);
    } else if (role === 'technicien') {
      query += ' WHERE r.technicien_id = ?';
      params.push(userId);
    } // admin sees all

    query += ' ORDER BY r.created_at DESC';

    const [requests] = await pool.query(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des demandes', error: error.message });
  }
});

// 3. Get single repair request with details and status history timeline
router.get('/:id', authenticateToken, async (req, res) => {
  const requestId = req.params.id;
  const { role, id: userId } = req.user;

  try {
    // 1. Get request and material info
    const [requests] = await pool.query(
      `SELECT r.id, r.employee_id, r.material_id, r.description_probleme, r.priority, r.statut_actuel, r.technicien_id, r.created_at, r.updated_at,
              m.type, m.marque, m.modele, m.numero_serie,
              u_emp.nom_complet AS employee_nom, u_emp.email AS employee_email, d.nom AS departement_nom,
              u_tech.nom_complet AS technicien_nom, u_tech.email AS technicien_email
       FROM repair_requests r
       JOIN materials m ON r.material_id = m.id
       JOIN users u_emp ON r.employee_id = u_emp.id
       LEFT JOIN departments d ON u_emp.departement_id = d.id
       LEFT JOIN users u_tech ON r.technicien_id = u_tech.id
       WHERE r.id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Demande introuvable' });
    }

    const request = requests[0];

    // Access check: Employees can only see their own requests, Technicians only assigned requests (or if they need to see details of assigned ones)
    if (role === 'employe' && request.employee_id !== userId) {
      return res.status(403).json({ message: 'Accès interdit à cette demande' });
    }
    if (role === 'technicien' && request.technicien_id !== userId) {
      return res.status(403).json({ message: 'Accès interdit. Cette demande ne vous est pas assignée.' });
    }

    // 2. Get status history timeline
    const [history] = await pool.query(
      `SELECT h.id, h.statut, h.commentaire, h.created_at,
              u.nom_complet AS changed_by_nom, u.role AS changed_by_role
       FROM status_history h
       JOIN users u ON h.changed_by_id = u.id
       WHERE h.request_id = ?
       ORDER BY h.created_at DESC`,
      [requestId]
    );

    res.json({
      ...request,
      history
    });
  } catch (error) {
    console.error('Get request details error:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des détails', error: error.message });
  }
});

// 4. Update repair request status (Technicians and Admins)
router.put('/:id/status', authenticateToken, requireRole(['technicien', 'admin']), async (req, res) => {
  const requestId = req.params.id;
  const { statut, commentaire } = req.body;
  const { id: userId, role } = req.user;

  if (!statut || !commentaire) {
    return res.status(400).json({ message: 'Le statut et le commentaire sont requis pour la mise à jour' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verify ownership if Technician
    const [requests] = await connection.query('SELECT * FROM repair_requests WHERE id = ?', [requestId]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Demande de réparation introuvable' });
    }

    const request = requests[0];
    if (role === 'technicien' && request.technicien_id !== userId) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que les demandes qui vous sont assignées.' });
    }

    // Update statut_actuel
    await connection.query(
      'UPDATE repair_requests SET statut_actuel = ? WHERE id = ?',
      [statut, requestId]
    );

    // Insert history record
    await connection.query(
      'INSERT INTO status_history (request_id, statut, commentaire, changed_by_id) VALUES (?, ?, ?, ?)',
      [requestId, statut, commentaire, userId]
    );

    await connection.commit();
    res.json({ message: 'Statut mis à jour avec succès et enregistré dans l\'historique.' });
  } catch (error) {
    await connection.rollback();
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du statut', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
