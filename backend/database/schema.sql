-- ===========================================
-- PROJET SILEX - DATABASE SCHEMA
-- ===========================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS silex_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE silex_project;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'developer', 'designer', 'tester') DEFAULT 'developer',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des spécifications
CREATE TABLE IF NOT EXISTS specifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    domain VARCHAR(50) NOT NULL,
    priority INT DEFAULT 50,
    status ENUM('not-started', 'in-progress', 'standby', 'completed') DEFAULT 'not-started',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des tâches
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    status ENUM('not-started', 'in-progress', 'standby', 'completed') DEFAULT 'not-started',
    domain VARCHAR(50) NOT NULL,
    condition_text TEXT,
    duration VARCHAR(20),
    difficulty INT DEFAULT 5,
    priority INT DEFAULT 50,
    assignee_id INT,
    specification_id VARCHAR(50),
    progress INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (specification_id) REFERENCES specifications(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table des sous-tâches
CREATE TABLE IF NOT EXISTS subtasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    level INT DEFAULT 0,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Table des commentaires/notes
CREATE TABLE IF NOT EXISTS task_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des sessions utilisateur (pour la synchronisation en temps réel)
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id INT NOT NULL,
    socket_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des modifications (pour l'historique et la synchronisation)
CREATE TABLE IF NOT EXISTS change_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    old_data JSON,
    new_data JSON,
    user_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour optimiser les performances
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_specification ON tasks(specification_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_change_log_table_record ON change_log(table_name, record_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);

-- Insérer des utilisateurs par défaut
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@silex.local', '$2b$10$dummy.hash.for.demo', 'admin'),
('designer', 'designer@silex.local', '$2b$10$dummy.hash.for.demo', 'designer'),
('developer', 'developer@silex.local', '$2b$10$dummy.hash.for.demo', 'developer'),
('tester', 'tester@silex.local', '$2b$10$dummy.hash.for.demo', 'tester');

-- Insérer les spécifications par défaut
INSERT INTO specifications (id, title, description, domain, priority, status, created_by) VALUES
('interface-horror', '🎨 Interface Horror Organique', 'Interface sombre avec palette horror professionnelle', 'graphics-2d', 95, 'completed', 1),
('gestion-taches', '📋 Système de Gestion des Tâches', 'CRUD complet avec sous-tâches hiérarchiques', 'site-dev', 98, 'completed', 1),
('dashboard-analytics', '📊 Tableau de Bord Analytics', 'Statistiques en temps réel et visualisations', 'site-dev', 85, 'completed', 1),
('performance-optim', '⚡ Optimisations Performance', 'Application optimisée pour les performances', 'site-dev', 80, 'completed', 1),
('architecture-modulaire', '🏗️ Architecture Modulaire', 'Code organisé en modules réutilisables', 'site-dev', 90, 'completed', 1);
