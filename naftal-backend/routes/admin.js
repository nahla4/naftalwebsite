const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all admin endpoints
router.use(authenticateToken, requireRole(['admin']));

// 1. Get all users (employees and technicians)
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.nom_complet, u.email, u.role, u.created_at,
              d.nom AS departement_nom,
              s.nom AS specialite_nom
       FROM users u
       LEFT JOIN departments d ON u.departement_id = d.id
       LEFT JOIN specialties s ON u.specialite_id = s.id
       WHERE u.role != 'admin'
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs', error: error.message });
  }
});

// 2. Delete a user account
router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND role != ?', [userId, 'admin']);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable ou impossible à supprimer.' });
    }
    res.json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'utilisateur', error: error.message });
  }
});

// 3. Get all technicians (for selection dropdowns)
router.get('/technicians', async (req, res) => {
  try {
    const [technicians] = await pool.query(
      `SELECT u.id, u.nom_complet, u.email, s.nom AS specialite_nom
       FROM users u
       LEFT JOIN specialties s ON u.specialite_id = s.id
       WHERE u.role = 'technicien'
       ORDER BY u.nom_complet ASC`
    );
    res.json(technicians);
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des techniciens', error: error.message });
  }
});

// 4. Assign a technician to a request
router.put('/requests/:id/assign', async (req, res) => {
  const requestId = req.params.id;
  const { technicien_id } = req.body;
  const adminId = req.user.id;

  if (!technicien_id) {
    return res.status(400).json({ message: 'Veuillez sélectionner un technicien' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verify request exists
    const [requests] = await connection.query('SELECT * FROM repair_requests WHERE id = ?', [requestId]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Demande introuvable.' });
    }
    const request = requests[0];

    // 2. Verify technician exists
    const [techs] = await connection.query('SELECT * FROM users WHERE id = ? AND role = ?', [technicien_id, 'technicien']);
    if (techs.length === 0) {
      return res.status(404).json({ message: 'Technicien introuvable.' });
    }
    const tech = techs[0];

    // 3. Update the repair request: set technicien_id and set status to "Pris en charge" if it was "En attente de réponse"
    let newStatus = request.statut_actuel;
    let comment = `Matériel assigné au technicien ${tech.nom_complet} par l'administrateur.`;
    
    if (request.statut_actuel === 'En attente de réponse') {
      newStatus = 'Pris en charge';
      comment = `Matériel pris en charge. Assigné au technicien ${tech.nom_complet} par l'administrateur.`;
    }

    await connection.query(
      'UPDATE repair_requests SET technicien_id = ?, statut_actuel = ? WHERE id = ?',
      [technicien_id, newStatus, requestId]
    );

    // 4. Record the assignment
    await connection.query(
      'INSERT INTO technician_assignments (request_id, technicien_id, assigned_by_id) VALUES (?, ?, ?)',
      [requestId, technicien_id, adminId]
    );

    // 5. Add to status history
    await connection.query(
      'INSERT INTO status_history (request_id, statut, commentaire, changed_by_id) VALUES (?, ?, ?, ?)',
      [requestId, newStatus, comment, adminId]
    );

    await connection.commit();
    res.json({ message: 'Technicien assigné avec succès et statut mis à jour.', technicien_nom: tech.nom_complet });
  } catch (error) {
    await connection.rollback();
    console.error('Assign technician error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'affectation du technicien', error: error.message });
  } finally {
    connection.release();
  }
});

// 5. Get system statistics (KPIs)
router.get('/stats', async (req, res) => {
  try {
    // Total requests
    const [[{ total_requests }]] = await pool.query('SELECT COUNT(*) AS total_requests FROM repair_requests');

    // Count by status
    const [status_counts] = await pool.query(
      'SELECT statut_actuel AS status, COUNT(*) AS count FROM repair_requests GROUP BY statut_actuel'
    );

    // Count by priority
    const [priority_counts] = await pool.query(
      'SELECT priority, COUNT(*) AS count FROM repair_requests GROUP BY priority'
    );

    // Total employees
    const [[{ total_employees }]] = await pool.query('SELECT COUNT(*) AS total_employees FROM users WHERE role = "employe"');

    // Total technicians
    const [[{ total_technicians }]] = await pool.query('SELECT COUNT(*) AS total_technicians FROM users WHERE role = "technicien"');

    // Compile counts
    const statusMap = {};
    status_counts.forEach(row => {
      statusMap[row.status] = row.count;
    });

    const priorityMap = {};
    priority_counts.forEach(row => {
      priorityMap[row.priority] = row.count;
    });

    res.json({
      total_requests,
      total_employees,
      total_technicians,
      by_status: statusMap,
      by_priority: priorityMap
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Erreur serveur lors du calcul des statistiques', error: error.message });
  }
});

module.exports = router;
