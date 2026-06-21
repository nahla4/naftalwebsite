const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// 1. Employee Registration
router.post('/employe/register', async (req, res) => {
  const { nom_complet, email, password, departement_id } = req.body;

  if (!nom_complet || !email || !password || !departement_id) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await pool.query(
      'INSERT INTO users (nom_complet, email, password, role, departement_id) VALUES (?, ?, ?, ?, ?)',
      [nom_complet, email, hashedPassword, 'employe', departement_id]
    );

    res.status(201).json({ message: 'Inscription employé réussie !' });
  } catch (error) {
    console.error('Register employe error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: error.message });
  }
});

// 2. Employee Login
router.post('/employe/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Veuillez saisir l\'email et le mot de passe' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'employe']);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error('Login employe error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// 3. Technician Registration
router.post('/technicien/register', async (req, res) => {
  const { nom_complet, email, password, specialite_id } = req.body;

  if (!nom_complet || !email || !password || !specialite_id) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires' });
  }

  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (nom_complet, email, password, role, specialite_id) VALUES (?, ?, ?, ?, ?)',
      [nom_complet, email, hashedPassword, 'technicien', specialite_id]
    );

    res.status(201).json({ message: 'Inscription technicien réussie !' });
  } catch (error) {
    console.error('Register technicien error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: error.message });
  }
});

// 4. Technician Login
router.post('/technicien/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Veuillez saisir l\'email et le mot de passe' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'technicien']);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error('Login technicien error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// 5. Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Veuillez saisir l\'email et le mot de passe' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, 'admin']);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Compte administrateur introuvable' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Connexion administrateur réussie', token });
  } catch (error) {
    console.error('Login admin error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// 6. Get current logged-in user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.nom_complet, u.email, u.role, u.departement_id, u.specialite_id, u.created_at,
              d.nom AS departement_nom, s.nom AS specialite_nom
       FROM users u
       LEFT JOIN departments d ON u.departement_id = d.id
       LEFT JOIN specialties s ON u.specialite_id = s.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// 7. Update profile details
router.put('/profile', authenticateToken, async (req, res) => {
  const { nom_complet, email, password } = req.body;

  if (!nom_complet || !email) {
    return res.status(400).json({ message: 'Le nom complet et l\'email sont requis' });
  }

  try {
    // Check if email taken by someone else
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre compte' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET nom_complet = ?, email = ?, password = ? WHERE id = ?',
        [nom_complet, email, hashedPassword, req.user.id]
      );
    } else {
      await pool.query(
        'UPDATE users SET nom_complet = ?, email = ? WHERE id = ?',
        [nom_complet, email, req.user.id]
      );
    }

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour', error: error.message });
  }
});

module.exports = router;
