const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../'));

// Configuration de la base de données
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'silex_project',
    charset: 'utf8mb4'
};

let db;

// Initialiser la connexion à la base de données
async function initDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}

// Gestion des connexions Socket.IO
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    
    socket.on('user-login', (userData) => {
        connectedUsers.set(socket.id, {
            userId: userData.userId,
            username: userData.username,
            socketId: socket.id
        });
        
        // Notifier les autres utilisateurs
        socket.broadcast.emit('user-joined', {
            username: userData.username,
            userId: userData.userId
        });
        
        console.log('✅ User logged in:', userData.username);
    });
    
    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            connectedUsers.delete(socket.id);
            socket.broadcast.emit('user-left', {
                username: user.username,
                userId: user.userId
            });
            console.log('👋 User disconnected:', user.username);
        }
    });
});

// Fonction pour diffuser les changements
function broadcastChange(type, data, excludeSocketId = null) {
    io.emit('data-update', {
        type,
        data,
        timestamp: new Date().toISOString()
    });
}

// ===========================================
// API ROUTES - TASKS
// ===========================================

// GET - Récupérer toutes les tâches
app.get('/api/tasks', async (req, res) => {
    try {
        const [tasks] = await db.execute(`
            SELECT t.*, u.username as assignee_name, s.title as specification_title,
                   uc.username as created_by_name
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            LEFT JOIN specifications s ON t.specification_id = s.id
            LEFT JOIN users uc ON t.created_by = uc.id
            ORDER BY t.created_at DESC
        `);
        
        // Récupérer les sous-tâches pour chaque tâche
        for (let task of tasks) {
            const [subtasks] = await db.execute(
                'SELECT * FROM subtasks WHERE task_id = ? ORDER BY order_index, id',
                [task.id]
            );
            task.subtasks = subtasks;
        }
        
        res.json(tasks);
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST - Créer une nouvelle tâche
app.post('/api/tasks', async (req, res) => {
    try {
        const {
            title, description, deadline, status, domain, condition_text,
            duration, difficulty, priority, assignee_id, specification_id,
            subtasks, created_by
        } = req.body;
        
        const [result] = await db.execute(`
            INSERT INTO tasks (title, description, deadline, status, domain, condition_text,
                             duration, difficulty, priority, assignee_id, specification_id, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, description, deadline, status, domain, condition_text,
            duration, difficulty, priority, assignee_id, specification_id, created_by]);
        
        const taskId = result.insertId;
        
        // Ajouter les sous-tâches
        if (subtasks && subtasks.length > 0) {
            for (let i = 0; i < subtasks.length; i++) {
                const subtask = subtasks[i];
                await db.execute(
                    'INSERT INTO subtasks (task_id, text, completed, level, order_index) VALUES (?, ?, ?, ?, ?)',
                    [taskId, subtask.text, subtask.completed || false, subtask.level || 0, i]
                );
            }
        }
        
        // Récupérer la tâche créée avec toutes ses données
        const [newTask] = await db.execute(`
            SELECT t.*, u.username as assignee_name, s.title as specification_title
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            LEFT JOIN specifications s ON t.specification_id = s.id
            WHERE t.id = ?
        `, [taskId]);
        
        const [newSubtasks] = await db.execute(
            'SELECT * FROM subtasks WHERE task_id = ? ORDER BY order_index',
            [taskId]
        );
        
        newTask[0].subtasks = newSubtasks;
        
        // Diffuser le changement
        broadcastChange('task-created', newTask[0]);
        
        res.status(201).json(newTask[0]);
    } catch (error) {
        console.error('❌ Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT - Mettre à jour une tâche
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const {
            title, description, deadline, status, domain, condition_text,
            duration, difficulty, priority, assignee_id, specification_id,
            subtasks
        } = req.body;
        
        await db.execute(`
            UPDATE tasks SET title=?, description=?, deadline=?, status=?, domain=?, condition_text=?,
                           duration=?, difficulty=?, priority=?, assignee_id=?, specification_id=?, updated_at=NOW()
            WHERE id=?
        `, [title, description, deadline, status, domain, condition_text,
            duration, difficulty, priority, assignee_id, specification_id, taskId]);
        
        // Mettre à jour les sous-tâches
        await db.execute('DELETE FROM subtasks WHERE task_id = ?', [taskId]);
        
        if (subtasks && subtasks.length > 0) {
            for (let i = 0; i < subtasks.length; i++) {
                const subtask = subtasks[i];
                await db.execute(
                    'INSERT INTO subtasks (task_id, text, completed, level, order_index) VALUES (?, ?, ?, ?, ?)',
                    [taskId, subtask.text, subtask.completed || false, subtask.level || 0, i]
                );
            }
        }
        
        // Récupérer la tâche mise à jour
        const [updatedTask] = await db.execute(`
            SELECT t.*, u.username as assignee_name, s.title as specification_title
            FROM tasks t
            LEFT JOIN users u ON t.assignee_id = u.id
            LEFT JOIN specifications s ON t.specification_id = s.id
            WHERE t.id = ?
        `, [taskId]);
        
        const [updatedSubtasks] = await db.execute(
            'SELECT * FROM subtasks WHERE task_id = ? ORDER BY order_index',
            [taskId]
        );
        
        updatedTask[0].subtasks = updatedSubtasks;
        
        // Diffuser le changement
        broadcastChange('task-updated', updatedTask[0]);
        
        res.json(updatedTask[0]);
    } catch (error) {
        console.error('❌ Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE - Supprimer une tâche
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        
        await db.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
        
        // Diffuser le changement
        broadcastChange('task-deleted', { id: taskId });
        
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// ===========================================
// API ROUTES - SPECIFICATIONS
// ===========================================

// GET - Récupérer toutes les spécifications
app.get('/api/specifications', async (req, res) => {
    try {
        const [specs] = await db.execute(`
            SELECT s.*, u.username as created_by_name
            FROM specifications s
            LEFT JOIN users u ON s.created_by = u.id
            ORDER BY s.priority DESC, s.created_at DESC
        `);
        
        // Ajouter les tâches associées pour chaque spécification
        for (let spec of specs) {
            const [tasks] = await db.execute(
                'SELECT id FROM tasks WHERE specification_id = ?',
                [spec.id]
            );
            spec.tachesAssociees = tasks.map(t => t.id);
        }
        
        res.json(specs);
    } catch (error) {
        console.error('❌ Error fetching specifications:', error);
        res.status(500).json({ error: 'Failed to fetch specifications' });
    }
});

// POST - Créer une nouvelle spécification
app.post('/api/specifications', async (req, res) => {
    try {
        const { id, title, description, domain, priority, status, created_by } = req.body;
        
        await db.execute(`
            INSERT INTO specifications (id, title, description, domain, priority, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, title, description, domain, priority, status, created_by]);
        
        const [newSpec] = await db.execute(`
            SELECT s.*, u.username as created_by_name
            FROM specifications s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.id = ?
        `, [id]);
        
        newSpec[0].tachesAssociees = [];
        
        // Diffuser le changement
        broadcastChange('specification-created', newSpec[0]);
        
        res.status(201).json(newSpec[0]);
    } catch (error) {
        console.error('❌ Error creating specification:', error);
        res.status(500).json({ error: 'Failed to create specification' });
    }
});

// PUT - Mettre à jour une spécification
app.put('/api/specifications/:id', async (req, res) => {
    try {
        const specId = req.params.id;
        const { title, description, domain, priority, status } = req.body;
        
        await db.execute(`
            UPDATE specifications SET title=?, description=?, domain=?, priority=?, status=?, updated_at=NOW()
            WHERE id=?
        `, [title, description, domain, priority, status, specId]);
        
        const [updatedSpec] = await db.execute(`
            SELECT s.*, u.username as created_by_name
            FROM specifications s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.id = ?
        `, [specId]);
        
        const [tasks] = await db.execute(
            'SELECT id FROM tasks WHERE specification_id = ?',
            [specId]
        );
        updatedSpec[0].tachesAssociees = tasks.map(t => t.id);
        
        // Diffuser le changement
        broadcastChange('specification-updated', updatedSpec[0]);
        
        res.json(updatedSpec[0]);
    } catch (error) {
        console.error('❌ Error updating specification:', error);
        res.status(500).json({ error: 'Failed to update specification' });
    }
});

// DELETE - Supprimer une spécification
app.delete('/api/specifications/:id', async (req, res) => {
    try {
        const specId = req.params.id;
        
        // Dissocier les tâches de cette spécification
        await db.execute('UPDATE tasks SET specification_id = NULL WHERE specification_id = ?', [specId]);
        
        // Supprimer la spécification
        await db.execute('DELETE FROM specifications WHERE id = ?', [specId]);
        
        // Diffuser le changement
        broadcastChange('specification-deleted', { id: specId });
        
        res.json({ message: 'Specification deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting specification:', error);
        res.status(500).json({ error: 'Failed to delete specification' });
    }
});

// ===========================================
// API ROUTES - USERS
// ===========================================

// GET - Récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, username, email, role, avatar_url, created_at, last_login, is_active
            FROM users WHERE is_active = TRUE
            ORDER BY username
        `);
        
        res.json(users);
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET - Utilisateurs connectés
app.get('/api/users/online', (req, res) => {
    const onlineUsers = Array.from(connectedUsers.values());
    res.json(onlineUsers);
});

// ===========================================
// ASSIGNMENT ROUTES
// ===========================================

// POST - Assigner une tâche à une spécification
app.post('/api/assign-task', async (req, res) => {
    try {
        const { taskId, specificationId } = req.body;
        
        await db.execute(
            'UPDATE tasks SET specification_id = ? WHERE id = ?',
            [specificationId, taskId]
        );
        
        // Diffuser le changement
        broadcastChange('task-assigned', { taskId, specificationId });
        
        res.json({ message: 'Task assigned successfully' });
    } catch (error) {
        console.error('❌ Error assigning task:', error);
        res.status(500).json({ error: 'Failed to assign task' });
    }
});

// POST - Désassigner une tâche d'une spécification
app.post('/api/unassign-task', async (req, res) => {
    try {
        const { taskId } = req.body;
        
        await db.execute(
            'UPDATE tasks SET specification_id = NULL WHERE id = ?',
            [taskId]
        );
        
        // Diffuser le changement
        broadcastChange('task-unassigned', { taskId });
        
        res.json({ message: 'Task unassigned successfully' });
    } catch (error) {
        console.error('❌ Error unassigning task:', error);
        res.status(500).json({ error: 'Failed to unassign task' });
    }
});

// ===========================================
// SERVER STARTUP
// ===========================================

const PORT = process.env.PORT || 3001;

async function startServer() {
    await initDatabase();
    
    server.listen(PORT, () => {
        console.log(`🚀 Silex Backend Server running on port ${PORT}`);
        console.log(`📡 Socket.IO server running`);
        console.log(`🌐 Frontend served at http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    if (db) {
        await db.end();
        console.log('✅ Database connection closed');
    }
    process.exit(0);
});
