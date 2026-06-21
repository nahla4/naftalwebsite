CREATE DATABASE IF NOT EXISTS naftfix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naftfix_db;

-- 1. Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 2. Specialties table
CREATE TABLE IF NOT EXISTS specialties (
    id INT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 3. Users table (stores employees, technicians, administrators)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('employe', 'technicien', 'admin') NOT NULL DEFAULT 'employe',
    departement_id INT NULL,
    specialite_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departement_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (specialite_id) REFERENCES specialties(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Materials table (stores hardware details)
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Repair Requests table
CREATE TABLE IF NOT EXISTS repair_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    material_id INT NOT NULL,
    description_probleme TEXT NOT NULL,
    priority ENUM('Faible', 'Moyenne', 'Elevee', 'Urgente') DEFAULT 'Moyenne',
    statut_actuel VARCHAR(100) DEFAULT 'En attente de réponse',
    technicien_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Status History table (stores date, status, comment, author of every change)
CREATE TABLE IF NOT EXISTS status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    statut VARCHAR(100) NOT NULL,
    commentaire TEXT,
    changed_by_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES repair_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Technician Assignments table (stores historic assignments)
CREATE TABLE IF NOT EXISTS technician_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    technicien_id INT NOT NULL,
    assigned_by_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES repair_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Prepopulate departments
INSERT IGNORE INTO departments (id, nom) VALUES
(1, 'Juridique'),
(2, 'Informatique'),
(3, 'Laboratoire'),
(4, 'Maintenance'),
(5, 'Exploitation'),
(6, 'Logistique'),
(7, 'Ressources Humaines'),
(8, 'Finances'),
(9, 'Commercial'),
(10, 'QHSE'),
(11, 'Achats'),
(12, 'Magasin'),
(13, 'Direction Technique'),
(14, 'Direction Carburant'),
(15, 'Administration Générale'),
(16, 'Transport');

-- Prepopulate specialties
INSERT IGNORE INTO specialties (id, nom) VALUES
(1, 'Informatique'),
(2, 'Maintenance industrielle'),
(3, 'Électricité'),
(4, 'Mécanique'),
(5, 'Laboratoire'),
(6, 'Technicien sécurité incendie');

-- password is 'Admin@Naftal2024', bcrypt hash below is valid and verified
INSERT IGNORE INTO users (nom_complet, email, password, role) VALUES
('Directeur Naftfix', 'admin@naftal.dz', '$2b$10$Q7oVY6P/wNF.HUER46e5Bei92C3t26tatoO0LkSHfYDQiRY3MTKWa', 'admin');
