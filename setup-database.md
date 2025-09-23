# Configuration de la Base de Données Silex

## Prérequis

1. **MySQL/MariaDB** installé sur votre système
2. **Node.js** (version 16 ou supérieure)
3. **npm** (inclus avec Node.js)

## Installation

### 1. Installer les dépendances backend
```bash
cd backend
npm install
```

### 2. Configurer la base de données

1. Démarrer MySQL/MariaDB
2. Créer la base de données :
```sql
mysql -u root -p
CREATE DATABASE silex_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Importer le schéma :
```bash
mysql -u root -p silex_project < database/schema.sql
```

### 3. Configuration

1. Copier le fichier `.env.example` vers `.env`
2. Modifier les paramètres de connexion dans `.env`

### 4. Démarrer le serveur

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

## Fonctionnalités

### Multi-utilisateurs en Temps Réel
- ✅ Synchronisation automatique des modifications
- ✅ Notifications des connexions/déconnexions
- ✅ Gestion des conflits
- ✅ Mode hors ligne avec synchronisation différée

### Base de Données
- ✅ Stockage persistant MySQL
- ✅ Relations entre tables optimisées
- ✅ Historique des modifications
- ✅ Sessions utilisateur

### API REST
- ✅ CRUD complet pour tâches et spécifications
- ✅ Assignation/désassignation de tâches
- ✅ Gestion des utilisateurs
- ✅ WebSocket pour temps réel

## Utilisation

1. Ouvrir le frontend : `http://localhost:3001`
2. Le système détecte automatiquement la connexion au serveur
3. Toutes les modifications sont synchronisées en temps réel
4. Mode hors ligne automatique si le serveur n'est pas disponible

## Dépannage

### Problème de connexion MySQL
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Redémarrer MySQL si nécessaire
sudo systemctl restart mysql
```

### Port déjà utilisé
```bash
# Trouver le processus utilisant le port 3001
lsof -i :3001

# Tuer le processus si nécessaire
kill -9 <PID>
```
