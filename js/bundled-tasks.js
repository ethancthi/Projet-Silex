// ===========================================
// PROJET SILEX - BUNDLED VERSION FOR DIRECT FILE ACCESS
// ===========================================

// Global state
let tasks = [];
let specifications = [];
let currentFilter = 'all';
let taskIdCounter = 1;

// Prédéfinir les caractéristiques du cahier des charges
const CAHIER_DES_CHARGES_SPECS = [
    {
        id: 'interface-horror',
        title: '🎨 Interface Horror Organique',
        domain: 'graphics-2d',
        description: 'Interface sombre avec palette horror professionnelle',
        priority: 95,
        status: 'completed'
    },
    {
        id: 'gestion-taches',
        title: '📋 Système de Gestion des Tâches',
        domain: 'site-dev',
        description: 'CRUD complet avec sous-tâches hiérarchiques',
        priority: 98,
        status: 'completed'
    },
    {
        id: 'dashboard-analytics',
        title: '📊 Tableau de Bord Analytics',
        domain: 'site-dev',
        description: 'Statistiques en temps réel et visualisations',
        priority: 85,
        status: 'completed'
    },
    {
        id: 'performance-optim',
        title: '⚡ Optimisations Performance',
        domain: 'site-dev',
        description: 'Application optimisée pour les performances',
        priority: 80,
        status: 'completed'
    },
    {
        id: 'architecture-modulaire',
        title: '🏗️ Architecture Modulaire',
        domain: 'site-dev',
        description: 'Code organisé en modules réutilisables',
        priority: 90,
        status: 'completed'
    }
];

// Configuration
const CONFIG = {
    STORAGE_KEY: 'silexTasks',
    SPECS_KEY: 'silexSpecifications',
    COUNTER_KEY: 'silexTaskCounter',
    AUDIO_KEY: 'silexAudioEnabled',
    
    ANIMATION_DURATIONS: {
        short: 200,
        normal: 300,
        long: 500
    },
    
    AUDIO: {
        FREQUENCIES: {
            click: 120,
            hover: 200,
            complete: [130.81, 164.81, 196.00],
            error: 150,
            heartbeat: [60, 80],
            breathing: 40
        },
        
        VOLUMES: {
            click: 0.1,
            hover: 0.03,
            complete: 0.08,
            error: 0.1,
            heartbeat: 0.15,
            breathing: 0.05,
            ambient: 0.02
        },
        
        PATHS: {
            ambientSoundPath: './assets/sound/ambient.mp3',
            clickSoundPath: './assets/sound/click.mp3',
            notificationSoundPath: './assets/sound/notification.mp3'
        }
    },
    
    PERFORMANCE: {
        enableAnimations: true,
        enableCursorEffects: true,
        enableParticles: true,
        particleCount: 20,
        MAX_PARTICLES: 100,
        PARTICLE_CLEANUP_INTERVAL: 10000
    }
};

// Configuration API
const API_CONFIG = {
    BASE_URL: 'http://localhost:3001/api',
    SOCKET_URL: 'http://localhost:3001',
    CURRENT_USER: {
        id: 1, // Par défaut, sera modifié lors de l'authentification
        username: 'Utilisateur Local',
        role: 'developer'
    }
};

// Variables pour la synchronisation temps réel
let socket = null;
let isOnline = false;

// ===========================================
// API CLIENT FUNCTIONS
// ===========================================

class SilexAPI {
    static async request(endpoint, options = {}) {
        try {
            const url = `${API_CONFIG.BASE_URL}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ API Request failed:', error);
            
            // Fallback en mode hors ligne
            if (!isOnline) {
                return this.handleOfflineRequest(endpoint, options);
            }
            
            throw error;
        }
    }
    
    static handleOfflineRequest(endpoint, options) {
        console.warn('⚠️ Working in offline mode for:', endpoint);
        
        // Retourner les données du localStorage en mode hors ligne
        if (endpoint === '/tasks' && options.method !== 'POST') {
            return loadTasksFromStorage();
        } else if (endpoint === '/specifications' && options.method !== 'POST') {
            return loadSpecificationsFromStorage();
        }
        
        return [];
    }
    
    // Méthodes pour les tâches
    static async getTasks() {
        return await this.request('/tasks');
    }
    
    static async createTask(taskData) {
        return await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                ...taskData,
                created_by: API_CONFIG.CURRENT_USER.id
            })
        });
    }
    
    static async updateTask(taskId, taskData) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }
    
    static async deleteTask(taskId) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }
    
    // Méthodes pour les spécifications
    static async getSpecifications() {
        return await this.request('/specifications');
    }
    
    static async createSpecification(specData) {
        return await this.request('/specifications', {
            method: 'POST',
            body: JSON.stringify({
                ...specData,
                created_by: API_CONFIG.CURRENT_USER.id
            })
        });
    }
    
    static async updateSpecification(specId, specData) {
        return await this.request(`/specifications/${specId}`, {
            method: 'PUT',
            body: JSON.stringify(specData)
        });
    }
    
    static async deleteSpecification(specId) {
        return await this.request(`/specifications/${specId}`, {
            method: 'DELETE'
        });
    }
    
    // Méthodes pour les utilisateurs
    static async getUsers() {
        return await this.request('/users');
    }
    
    static async getOnlineUsers() {
        return await this.request('/users/online');
    }
    
    // Méthodes d'assignation
    static async assignTask(taskId, specificationId) {
        return await this.request('/assign-task', {
            method: 'POST',
            body: JSON.stringify({ taskId, specificationId })
        });
    }
    
    static async unassignTask(taskId) {
        return await this.request('/unassign-task', {
            method: 'POST',
            body: JSON.stringify({ taskId })
        });
    }
}

// ===========================================
// REAL-TIME SYNCHRONIZATION
// ===========================================

function initializeRealTimeSync() {
    try {
        // Importer socket.io-client
        if (typeof io !== 'undefined') {
            socket = io(API_CONFIG.SOCKET_URL);
            
            socket.on('connect', () => {
                console.log('🔌 Connected to real-time server');
                isOnline = true;
                
                // S'identifier auprès du serveur
                socket.emit('user-login', API_CONFIG.CURRENT_USER);
                
                showNotification('Connecté au serveur en temps réel', 'success');
            });
            
            socket.on('disconnect', () => {
                console.log('🔌 Disconnected from real-time server');
                isOnline = false;
                showNotification('Connexion au serveur perdue - Mode hors ligne', 'warning');
            });
            
            // Écouter les mises à jour de données
            socket.on('data-update', (update) => {
                handleRealTimeUpdate(update);
            });
            
            // Écouter les connexions/déconnexions d'utilisateurs
            socket.on('user-joined', (userData) => {
                showNotification(`${userData.username} s'est connecté`, 'info', 2000);
                updateOnlineUsers();
            });
            
            socket.on('user-left', (userData) => {
                showNotification(`${userData.username} s'est déconnecté`, 'info', 2000);
                updateOnlineUsers();
            });
            
        } else {
            console.warn('⚠️ Socket.IO client not available - working in offline mode');
            isOnline = false;
        }
    } catch (error) {
        console.error('❌ Failed to initialize real-time sync:', error);
        isOnline = false;
    }
}

function handleRealTimeUpdate(update) {
    console.log('📡 Real-time update received:', update);
    
    switch (update.type) {
        case 'task-created':
        case 'task-updated':
            // Mettre à jour la tâche dans le tableau local
            const taskIndex = tasks.findIndex(t => t.id === update.data.id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = update.data;
            } else {
                tasks.push(update.data);
            }
            updateTasksList();
            updateDashboard();
            break;
            
        case 'task-deleted':
            tasks = tasks.filter(t => t.id !== update.data.id);
            updateTasksList();
            updateDashboard();
            break;
            
        case 'specification-created':
        case 'specification-updated':
            const specIndex = specifications.findIndex(s => s.id === update.data.id);
            if (specIndex !== -1) {
                specifications[specIndex] = update.data;
            } else {
                specifications.push(update.data);
            }
            if (document.getElementById('specifications-list')) {
                updateSpecificationsList();
                updateSpecificationStats();
            }
            break;
            
        case 'specification-deleted':
            specifications = specifications.filter(s => s.id !== update.data.id);
            if (document.getElementById('specifications-list')) {
                updateSpecificationsList();
                updateSpecificationStats();
            }
            break;
            
        case 'task-assigned':
        case 'task-unassigned':
            // Recharger les données pour s'assurer de la cohérence
            loadDataFromAPI();
            break;
    }
}

async function updateOnlineUsers() {
    try {
        const onlineUsers = await SilexAPI.getOnlineUsers();
        
        // Mettre à jour l'affichage des utilisateurs en ligne
        const onlineUsersContainer = document.getElementById('online-users');
        if (onlineUsersContainer) {
            onlineUsersContainer.innerHTML = onlineUsers.map(user => `
                <div class="online-user">
                    <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                    <span class="user-name">${user.username}</span>
                    <div class="online-indicator"></div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('❌ Failed to update online users:', error);
    }
}

// ===========================================
// MODIFIED STORAGE FUNCTIONS
// ===========================================

async function loadDataFromAPI() {
    try {
        console.log('🔄 Loading data from API...');
        
        // Charger les tâches
        const apiTasks = await SilexAPI.getTasks();
        tasks.length = 0;
        tasks.push(...apiTasks);
        
        // Charger les spécifications
        const apiSpecs = await SilexAPI.getSpecifications();
        specifications.length = 0;
        specifications.push(...apiSpecs);
        
        // Mettre à jour l'UI
        updateTasksList();
        updateDashboard();
        
        if (document.getElementById('specifications-list')) {
            updateSpecificationsList();
            updateSpecificationStats();
        }
        
        console.log('✅ Data loaded from API:', { tasks: tasks.length, specs: specifications.length });
        
    } catch (error) {
        console.error('❌ Failed to load data from API, falling back to local storage:', error);
        
        // Fallback vers le localStorage
        loadTasksFromStorage();
        loadSpecificationsFromStorage();
        
        showNotification('Chargement depuis le cache local - Données possiblement obsolètes', 'warning');
    }
}

// Modifier les fonctions de sauvegarde pour utiliser l'API
async function saveTaskToAPI(task, isUpdate = false) {
    try {
        if (isUpdate) {
            return await SilexAPI.updateTask(task.id, task);
        } else {
            return await SilexAPI.createTask(task);
        }
    } catch (error) {
        console.error('❌ Failed to save task to API:', error);
        
        // Fallback vers localStorage
        saveTasksToStorage();
        throw error;
    }
}

async function deleteTaskFromAPI(taskId) {
    try {
        await SilexAPI.deleteTask(taskId);
    } catch (error) {
        console.error('❌ Failed to delete task from API:', error);
        
        // Fallback vers localStorage
        saveTasksToStorage();
        throw error;
    }
}

// Modifier la fonction addTask pour utiliser l'API
async function addTask(task) {
    console.log('🐛 DEBUG: addTask called with:', task);
    
    try {
        // Sauvegarder vers l'API
        const savedTask = await saveTaskToAPI(task);
        
        // Mettre à jour le tableau local
        const existingIndex = tasks.findIndex(t => t.id === savedTask.id);
        if (existingIndex !== -1) {
            tasks[existingIndex] = savedTask;
        } else {
            tasks.push(savedTask);
        }
        
        console.log('✅ Task saved to API and local state updated');
        
    } catch (error) {
        console.error('❌ Failed to save task to API, saving locally only:', error);
        
        // Fallback vers l'ajout local uniquement
        tasks.push(task);
        saveTasksToStorage();
        
        showNotification('Tâche sauvegardée localement - Synchronisation différée', 'warning');
    }
}

// Modifier les fonctions de spécifications pour utiliser l'API
async function addSpecification() {
    console.log('➕ Adding new specification...');
    
    const title = document.getElementById('spec-title')?.value.trim();
    const domain = document.getElementById('spec-domain')?.value;
    const priority = parseInt(document.getElementById('spec-priority')?.value) || 50;
    const description = document.getElementById('spec-description')?.value.trim();
    const status = document.getElementById('spec-status')?.value || 'not-started';

    if (!title || !description) {
        showNotification('Veuillez remplir le titre et la description', 'error');
        return;
    }

    const newSpec = {
        id: 'spec-' + Date.now(),
        title: title,
        domain: domain,
        description: description,
        priority: priority,
        status: status
    };

    try {
        // Sauvegarder vers l'API
        const savedSpec = await SilexAPI.createSpecification(newSpec);
        
        // Mettre à jour le tableau local
        specifications.push(savedSpec);
        
        updateSpecificationsList();
        clearSpecificationForm();
        showNotification('Spécification ajoutée avec succès', 'success');
        
    } catch (error) {
        console.error('❌ Failed to save specification to API:', error);
        
        // Fallback vers l'ajout local
        specifications.push(newSpec);
        saveSpecificationsToStorage();
        updateSpecificationsList();
        clearSpecificationForm();
        
        showNotification('Spécification sauvegardée localement - Synchronisation différée', 'warning');
    }
}

// ===========================================
// TASK FUNCTIONS
// ===========================================
function incrementTaskIdCounter() {
    return ++taskIdCounter;
}

function updateTasksList() {
    console.log('🐛 DEBUG: updateTasksList called');
    
    const tasksListElement = document.getElementById('tasks-list');
    if (!tasksListElement) {
        console.warn('⚠️ Tasks list element not found');
        return;
    }
    
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksListElement.innerHTML = '<p class="no-tasks">Aucune tâche pour le moment.</p>';
        return;
    }
    
    let html = '';
    filteredTasks.forEach(task => {
        const daysRemaining = calculateDaysRemaining(task.deadline);
        const statusText = getStatusText(task.status);
        const domainText = getDomainText(task.domain);
        const caracteristiqueText = getCaracteristiqueText(task.caracteristique);
        
        // Déterminer la classe d'urgence
        let urgencyClass = '';
        let urgencyText = '';
        if (daysRemaining !== null) {
            if (daysRemaining < 0) {
                urgencyClass = 'task-overdue';
                urgencyText = '⚠️ En retard';
            } else if (daysRemaining <= 3) {
                urgencyClass = 'task-urgent';
                urgencyText = '🔥 Urgent';
            } else if (daysRemaining <= 7) {
                urgencyClass = 'task-warning';
                urgencyText = '⏰ Bientôt';
            }
        }
        
        // Format subtasks display avec barre de progression
        let subtasksHtml = '';
        let progressHtml = '';
        if (task.subtasks && task.subtasks.length > 0) {
            const completedSubtasks = task.subtasks.filter(st => st.completed).length;
            const progressPercent = Math.round((completedSubtasks / task.subtasks.length) * 100);
            
            subtasksHtml = `
                <div class="task-subtasks-info">
                    <span class="subtasks-count">📋 ${completedSubtasks}/${task.subtasks.length} sous-tâches</span>
                    <div class="progress-bar-mini">
                        <div class="progress-fill-mini" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-percent">${progressPercent}%</span>
                </div>
            `;
        }
        
        // Formater la deadline avec style
        let deadlineHtml = '';
        if (task.deadline) {
            const deadlineFormatted = formatDate(task.deadline);
            if (daysRemaining !== null) {
                if (daysRemaining < 0) {
                    deadlineHtml = `<span class="deadline-overdue">📅 ${deadlineFormatted} (${Math.abs(daysRemaining)} jours de retard)</span>`;
                } else if (daysRemaining === 0) {
                    deadlineHtml = `<span class="deadline-today">📅 ${deadlineFormatted} (Aujourd'hui!)</span>`;
                } else {
                    deadlineHtml = `<span class="deadline-normal">📅 ${deadlineFormatted} (dans ${daysRemaining} jours)</span>`;
                }
            } else {
                deadlineHtml = `<span class="deadline-normal">📅 ${deadlineFormatted}</span>`;
            }
        }
        
        html += `
            <div class="task-card breathing ${urgencyClass}" data-task-id="${task.id}">
                <div class="task-header">
                    <div class="task-title-section">
                        <h4 class="task-title">${task.title}</h4>
                        ${urgencyText ? `<span class="urgency-badge">${urgencyText}</span>` : ''}
                    </div>
                    <span class="task-status status-${task.status}">${statusText}</span>
                </div>
                
                <div class="task-meta-grid">
                    <div class="meta-item">
                        <span class="meta-icon">🏷️</span>
                        <div class="meta-content">
                            <span class="meta-label">Domaine</span>
                            <span class="meta-value">${domainText}</span>
                        </div>
                    </div>
                    
                    <div class="meta-item">
                        <span class="meta-icon">⚙️</span>
                        <div class="meta-content">
                            <span class="meta-label">Caractéristique</span>
                            <span class="meta-value">${caracteristiqueText}</span>
                        </div>
                    </div>
                    
                    <div class="meta-item meta-wide">
                        <span class="meta-icon">⏰</span>
                        <div class="meta-content">
                            <span class="meta-label">Deadline</span>
                            ${deadlineHtml}
                        </div>
                    </div>
                </div>
                
                <div class="task-metrics">
                    <div class="metric-item">
                        <div class="metric-circle priority-${Math.ceil(task.priority / 25)}">
                            <span class="metric-value">${task.priority}</span>
                        </div>
                        <span class="metric-label">Priorité</span>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-circle difficulty-${task.difficulty}">
                            <span class="metric-value">${task.difficulty}</span>
                        </div>
                        <span class="metric-label">Difficulté</span>
                    </div>
                    
                    <div class="metric-item metric-assignee">
                        <div class="assignee-avatar">
                            <span>${task.assignee ? task.assignee.charAt(0).toUpperCase() : '?'}</span>
                        </div>
                        <span class="metric-label">${task.assignee || 'Non assigné'}</span>
                    </div>
                </div>
                
                ${subtasksHtml}
                
                ${task.condition ? `
                    <div class="task-condition">
                        <span class="condition-icon">📝</span>
                        <span class="condition-text">${task.condition}</span>
                    </div>
                ` : ''}
                
                <div class="task-actions">
                    <button class="edit-btn" onclick="editTask(${task.id})">
                        <span class="btn-icon">✏️</span>
                        Modifier
                    </button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">
                        <span class="btn-icon">🗑️</span>
                        Supprimer
                    </button>
                    <button class="details-btn" onclick="showTaskDetails(${task.id})">
                        <span class="btn-icon">👁️</span>
                        Détails
                    </button>
                </div>
            </div>
        `;
    });
    
    tasksListElement.innerHTML = html;
    console.log('🐛 DEBUG: Tasks list updated with', filteredTasks.length, 'filtered tasks');
    
    // Update dashboard after task list update
    updateDashboard();
}

// ===========================================
// NOTIFICATION SYSTEM
// ===========================================
function showNotification(message, type = 'info', duration = 3000) {
    console.log(`📢 Notification: ${message} (${type})`);
    
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#0f5132' : type === 'error' ? '#842029' : '#0c4a6e'};
        color: white;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// ===========================================
// FORM HANDLING
// ===========================================
function updateRangeValues() {
    const difficultyRange = document.getElementById('task-difficulty');
    const priorityRange = document.getElementById('task-priority');
    const difficultyValue = document.getElementById('difficulty-value');
    const priorityValue = document.getElementById('priority-value');
    
    if (difficultyRange && difficultyValue) {
        difficultyValue.textContent = difficultyRange.value;
    }
    if (priorityRange && priorityValue) {
        priorityValue.textContent = priorityRange.value;
    }
}

function handleTaskSubmit(e) {
    console.log('🐛 DEBUG: handleTaskSubmit called');
    e.preventDefault();
    
    try {
        const form = e.target;
        const editingTaskId = form.dataset.editingTaskId;
        
        if (editingTaskId) {
            // Update existing task
            console.log('🐛 DEBUG: Updating existing task...');
            const taskData = createTaskFromForm();
            const taskIndex = tasks.findIndex(t => t.id === parseInt(editingTaskId));
            
            if (taskIndex !== -1) {
                const oldTask = tasks[taskIndex];
                
                // Keep the original ID and creation date
                taskData.id = parseInt(editingTaskId);
                taskData.createdAt = oldTask.createdAt;
                
                // Gérer les changements de caractéristique
                if (oldTask.caracteristique !== taskData.caracteristique) {
                    // Retirer de l'ancienne caractéristique
                    if (oldTask.caracteristique) {
                        const oldSpec = specifications.find(s => s.id === oldTask.caracteristique);
                        if (oldSpec && oldSpec.tachesAssociees) {
                            oldSpec.tachesAssociees = oldSpec.tachesAssociees.filter(id => id !== parseInt(editingTaskId));
                        }
                    }
                    
                    // Ajouter à la nouvelle caractéristique
                    if (taskData.caracteristique) {
                        const newSpec = specifications.find(s => s.id === taskData.caracteristique);
                        if (newSpec) {
                            if (!newSpec.tachesAssociees) {
                                newSpec.tachesAssociees = [];
                            }
                            if (!newSpec.tachesAssociees.includes(parseInt(editingTaskId))) {
                                newSpec.tachesAssociees.push(parseInt(editingTaskId));
                            }
                        }
                    }
                    
                    saveSpecificationsToStorage();
                }
                
                tasks[taskIndex] = taskData;
                saveTasksToStorage();
                
                // Reset editing mode
                delete form.dataset.editingTaskId;
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.innerHTML = `
                        <span>Créer la tâche</span>
                        <div class="blood-drip"></div>
                    `;
                }
                
                // Mettre à jour l'affichage des spécifications si on est sur la page cahier des charges
                if (document.getElementById('specifications-list')) {
                    updateAllSpecificationDisplays();
                }
                
                showNotification('Tâche mise à jour avec succès !', 'success');
            }
        } else {
            // Create new task
            console.log('🐛 DEBUG: Creating new task from form...');
            const task = createTaskFromForm();
            
            console.log('🐛 DEBUG: Adding task...');
            addTask(task);
            
            showNotification('Tâche créée avec succès !', 'success');
        }
        
        console.log('🐛 DEBUG: Resetting form...');
        form.reset();
        
        // Clear subtasks list
        const subtasksList = document.getElementById('subtasks-list');
        if (subtasksList) {
            subtasksList.innerHTML = '';
        }
        
        console.log('🐛 DEBUG: Updating UI...');
        updateRangeValues();
        updateTasksList();
        updateDashboard();
        
        console.log('🐛 DEBUG: Task operation completed successfully');
    } catch (error) {
        console.error('❌ ERROR in handleTaskSubmit:', error);
        showNotification('Erreur lors de l\'opération: ' + error.message, 'error');
    }
}

// Create demo tasks for testing
function createDemoTasks() {
    console.log('🎭 Creating demo tasks...');
    
    // Clear existing tasks
    tasks.length = 0;
    taskIdCounter = 1;
    
    const demoTasks = [
        {
            id: taskIdCounter++,
            title: "Conception de l'interface utilisateur",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
            status: 'in-progress',
            domain: 'graphics-2d',
            condition: 'Respecter la charte graphique organique',
            duration: '1w',
            difficulty: 6,
            priority: 95,
            assignee: 'Designer Principal',
            caracteristique: '',
            createdAt: new Date(),
            progress: 40,
            steps: [],
            subtasks: [
                { id: 1001, text: "Créer wireframes des pages principales", completed: true, level: 0 },
                { id: 1002, text: "Définir la palette de couleurs horror", completed: true, level: 0 },
                { id: 1003, text: "Créer les maquettes haute fidélité", completed: false, level: 0 },
                { id: 1004, text: "Tester l'interface sur mobile", completed: false, level: 0 }
            ]
        },
        {
            id: taskIdCounter++,
            title: "Développement de l'API backend",
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
            status: 'not-started',
            domain: 'site-dev',
            condition: 'Utiliser Node.js et Express',
            duration: '2w',
            difficulty: 8,
            priority: 90,
            assignee: 'Développeur Backend',
            caracteristique: '',
            createdAt: new Date(),
            progress: 0,
            steps: [],
            subtasks: [
                { id: 2001, text: "Configurer l'environnement de développement", completed: false, level: 0 },
                { id: 2002, text: "Créer les modèles de données", completed: false, level: 0 },
                { id: 2003, text: "Implémenter les routes API", completed: false, level: 0 }
            ]
        },
        {
            id: taskIdCounter++,
            title: "Tests et validation du système",
            deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Demain
            status: 'standby',
            domain: 'qa-management',
            condition: 'Tests unitaires et intégration',
            duration: '3d',
            difficulty: 7,
            priority: 85,
            assignee: 'Testeur QA',
            caracteristique: '',
            createdAt: new Date(),
            progress: 20,
            steps: [],
            subtasks: [
                { id: 3001, text: "Écrire les tests unitaires", completed: true, level: 0 },
                { id: 3002, text: "Tests d'intégration", completed: false, level: 0 },
                { id: 3003, text: "Tests de performance", completed: false, level: 0 },
                { id: 3004, text: "Tests de sécurité", completed: false, level: 0 },
                { id: 3005, text: "Documentation des bugs", completed: false, level: 0 }
            ]
        },
        {
            id: taskIdCounter++,
            title: "Rédaction de la documentation",
            deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hier (en retard)
            status: 'in-progress',
            domain: 'documentation',
            condition: 'Documentation complète et à jour',
            duration: '1w',
            difficulty: 4,
            priority: 75,
            assignee: 'Rédacteur Tech',
            caracteristique: '',
            createdAt: new Date(),
            progress: 60,
            steps: [],
            subtasks: [
                { id: 4001, text: "Documentation API", completed: true, level: 0 },
                { id: 4002, text: "Guide utilisateur", completed: true, level: 0 },
                { id: 4003, text: "Guide développeur", completed: false, level: 0 }
            ]
        },
        {
            id: taskIdCounter++,
            title: "Optimisation des performances",
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 2 semaines
            status: 'not-started',
            domain: 'site-dev',
            condition: 'Améliorer les temps de réponse',
            duration: '1w',
            difficulty: 9,
            priority: 70,
            assignee: 'Développeur Senior',
            caracteristique: '',
            createdAt: new Date(),
            progress: 0,
            steps: [],
            subtasks: []
        }
    ];
    
    // Add demo tasks to the array
    tasks.push(...demoTasks);
    
    // Save to storage
    saveTasksToStorage();
    
    // Update UI
    updateTasksList();
    updateDashboard();
    
    console.log('✅ Demo tasks created:', tasks.length);
    return demoTasks;
}

// ===========================================
// INITIALIZATION
// ===========================================
function initializeTaskSystem() {
    console.log('🚀 Initializing bundled task system...');
    
    // Initialiser la synchronisation temps réel
    initializeRealTimeSync();
    
    // Charger les données depuis l'API ou localStorage
    await loadDataFromAPI();
    
    // Setup form submission
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        console.log('✅ Task form found, attaching event listener');
        taskForm.addEventListener('submit', handleTaskSubmit);
    } else {
        console.warn('⚠️ Task form not found');
    }
    
    // Setup range inputs
    const difficultyRange = document.getElementById('task-difficulty');
    const priorityRange = document.getElementById('task-priority');
    
    if (difficultyRange) {
        difficultyRange.addEventListener('input', updateRangeValues);
    }
    if (priorityRange) {
        priorityRange.addEventListener('input', updateRangeValues);
    }
    
    // Initialize subtask functionality
    initializeSubtaskControls();
    
    // Initialize assignment controls
    initializeAssignmentControls();
    
    // Initialize filter controls  
    initializeFilterControls();
    
    // Initialize specification controls (if on cahier des charges page)
    initializeSpecificationControls();
    
    // Initial UI update
    updateRangeValues();
    updateTasksList();
    updateDashboard();
    
    // Force priority tasks update after a delay to ensure everything is loaded
    setTimeout(() => {
        console.log('🔄 Force updating priority tasks after delay...');
        updatePriorityTasks();
    }, 500);
    
    // Update specification displays if on cahier des charges page
    if (document.getElementById('specifications-list')) {
        updateAllSpecificationDisplays();
    }
    
    console.log('✅ Bundled task system initialized successfully');
}

function initializeSubtaskControls() {
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', () => {
            const input = document.getElementById('new-subtask-input');
            const subtasksList = document.getElementById('subtasks-list');
            
            if (!input || !subtasksList) {
                console.warn('⚠️ Subtask elements not found');
                return;
            }
            
            const subtaskText = input.value.trim();
            if (!subtaskText) {
                alert('Veuillez entrer un titre pour la sous-tâche.');
                return;
            }
            
            // Create subtask element
            const subtaskId = Date.now();
            const subtaskDiv = document.createElement('div');
            subtaskDiv.className = 'subtask-item';
            subtaskDiv.innerHTML = `
                <div class="subtask-content">
                    <input type="checkbox" id="subtask-${subtaskId}" class="subtask-checkbox">
                    <label for="subtask-${subtaskId}" class="subtask-label">${subtaskText}</label>
                    <button type="button" class="remove-subtask-btn" onclick="removeSubtask(this)">×</button>
                </div>
            `;
            
            subtasksList.appendChild(subtaskDiv);
            input.value = '';
            
            console.log('✅ Subtask added:', subtaskText);
        });
        console.log('✅ Add subtask button event listener attached');
    } else {
        console.warn('⚠️ Add subtask button not found');
    }
}

function removeSubtask(button) {
    const subtaskItem = button.closest('.subtask-item');
    if (subtaskItem) {
        subtaskItem.remove();
        console.log('✅ Subtask removed');
    }
}

function initializeAssignmentControls() {
    // Setup quick assign button from dashboard
    const quickAssignBtn = document.getElementById('quick-assign-btn');
    if (quickAssignBtn) {
        quickAssignBtn.addEventListener('click', () => {
            const taskSelect = document.getElementById('quick-assign-task');
            const userSelect = document.getElementById('quick-assign-user');
            
            if (!taskSelect || !userSelect) {
                console.warn('⚠️ Quick assignment elements not found');
                return;
            }
            
            const taskId = parseInt(taskSelect.value);
            const assignee = userSelect.value;
            
            if (!taskId) {
                alert('Veuillez sélectionner une tâche.');
                return;
            }
            
            if (!assignee) {
                alert('Veuillez sélectionner un utilisateur.');
                return;
            }
            
            // Find and update the task
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.assignee = assignee;
                saveTasksToStorage();
                updateTasksList();
                updateDashboard();
                
                // Reset form
                taskSelect.value = '';
                userSelect.value = '';
                
                alert(`Tâche "${task.title}" assignée à ${assignee}`);
                console.log('✅ Task assigned successfully:', task);
            }
        });
        console.log('✅ Quick assignment button event listener attached');
    }
    
    // Original bulk assignment controls (if they exist)
    const quickAssignmentControls = document.getElementById('quick-assignment-controls');
    if (!quickAssignmentControls) return;
    
    // Setup assign button
    const assignBtn = quickAssignmentControls.querySelector('#assign-selected');
    if (assignBtn) {
        assignBtn.addEventListener('click', () => {
            const selectedTasks = getSelectedTasks();
            const assignee = document.getElementById('assign-to-user').value;
            
            if (selectedTasks.length === 0) {
                alert('Veuillez sélectionner au moins une tâche.');
                return;
            }
            
            if (!assignee) {
                alert('Veuillez sélectionner un utilisateur.');
                return;
            }
            
            assignTasksToUser(selectedTasks, assignee);
        });
    }
    
    // Setup select all button
    const selectAllBtn = quickAssignmentControls.querySelector('#select-all-tasks');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.task-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            checkboxes.forEach(cb => cb.checked = !allChecked);
            updateQuickAssignmentUI();
        });
    }
}

function initializeFilterControls() {
    // Filter buttons from the tasks list
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter tasks
            filterTasks(filter);
            
            console.log('✅ Filter applied:', filter);
        });
    });
    
    // Status filter dropdown (if exists)
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            updateTasksList();
            updateDashboard();
        });
    }
    
    // Domain filter dropdown (if exists)
    const domainFilter = document.getElementById('domain-filter');
    if (domainFilter) {
        domainFilter.addEventListener('change', () => {
            updateTasksList();
            updateDashboard();
        });
    }
    
    // Assignee filter dropdown (if exists)
    const assigneeFilter = document.getElementById('assignee-filter');
    if (assigneeFilter) {
        assigneeFilter.addEventListener('change', () => {
            updateTasksList();
            updateDashboard();
        });
    }
    
    console.log('✅ Filter controls initialized');
}

function initializeSpecificationControls() {
    console.log('🚀 Initializing specification controls...');
    
    // Setup assign buttons
    const assignButtons = document.querySelectorAll('.assign-btn');
    assignButtons.forEach(button => {
        const specId = button.dataset.specId;
        if (specId) {
            button.addEventListener('click', () => {
                assignTaskFromSelectUI(specId);
            });
        }
    });
    
    console.log('✅ Specification controls initialized');
}

// Add CSS loading function for specifications
function loadSpecificationCSS() {
    // Check if specifications CSS is already loaded
    if (document.querySelector('link[href*="specifications.css"]')) {
        return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './css/specifications.css';
    document.head.appendChild(link);
    console.log('✅ Specifications CSS loaded');
}

// Mettre à jour l'affichage de la liste des spécifications
function updateSpecificationsList() {
    console.log('🔄 Updating specifications list...');
    const container = document.getElementById('specifications-list');
    if (!container) {
        console.warn('⚠️ Specifications list container not found');
        return;
    }

    if (specifications.length === 0) {
        container.innerHTML = '<p class="no-specs">Aucune caractéristique pour le moment. Utilisez le formulaire ci-dessus pour en ajouter.</p>';
        updateSpecificationStats();
        return;
    }

    let html = '';
    specifications.forEach(spec => {
        const domainText = getDomainText(spec.domain || spec.category);
        const statusText = getStatusText(spec.status);
        
        // Get assigned tasks for this specification
        const assignedTasks = spec.tachesAssociees ? 
            tasks.filter(task => spec.tachesAssociees.includes(task.id)) : [];
        
        let assignedTasksHtml = '';
        if (assignedTasks.length > 0) {
            assignedTasksHtml = assignedTasks.map(task => `
                <div class="assigned-task-item">
                    <span class="assigned-task-title">${task.title}</span>
                    <span class="assigned-task-status status-${task.status}">${getStatusText(task.status)}</span>
                    <button class="unassign-btn" onclick="unassignTaskFromSpecificationUI('${task.id}', '${spec.id}')">
                        ✖️
                    </button>
                </div>
            `).join('');
        } else {
            assignedTasksHtml = '<div class="empty-tasks-message">Aucune tâche assignée</div>';
        }
        
        // Get available tasks for assignment dropdown
        const availableTasks = tasks.filter(task => {
            return !spec.tachesAssociees || !spec.tachesAssociees.includes(task.id);
        });
        
        let taskOptionsHtml = '<option value="">Assigner une tâche...</option>';
        availableTasks.forEach(task => {
            taskOptionsHtml += `<option value="${task.id}">${task.title} (${getStatusText(task.status)})</option>`;
        });
        
        html += `
            <div class="spec-card task-card breathing" data-spec-id="${spec.id}" data-category="${spec.domain || spec.category}">
                <div class="spec-header task-header">
                    <h4 class="spec-title task-title">${spec.title}</h4>
                    <span class="spec-status task-status status-${spec.status}">${statusText}</span>
                </div>
                
                <div class="spec-content task-content">
                    <div class="spec-meta">
                        <p><strong>🏷️ Domaine:</strong> ${domainText}</p>
                        <p><strong>⭐ Priorité:</strong> ${spec.priority}/100</p>
                        <p><strong>📝 Description:</strong> ${spec.description}</p>
                    </div>
                    
                    <!-- Section des tâches assignées -->
                    <div class="spec-tasks-section">
                        <h5>📋 Tâches Assignées (${assignedTasks.length})</h5>
                        <div class="assigned-tasks-list" id="tasks-${spec.id}">
                            ${assignedTasksHtml}
                        </div>
                        <div class="assign-task-container">
                            <select class="task-assign-select" data-spec-id="${spec.id}">
                                ${taskOptionsHtml}
                            </select>
                            <button class="assign-btn breathing" onclick="assignTaskFromSelectUI('${spec.id}')">
                                📌 Assigner
                            </button>
                        </div>
                    </div>
                    
                    <div class="spec-actions task-actions">
                        <button class="edit-btn btn btn-secondary breathing" onclick="editSpecification('${spec.id}')">
                            ✏️ Modifier
                        </button>
                        <button class="delete-btn btn btn-danger breathing" onclick="deleteSpecification('${spec.id}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    updateSpecificationStats();
    console.log('✅ Specifications list updated with', specifications.length, 'items');
}

// Mettre à jour les statistiques des spécifications
function updateSpecificationStats() {
    const totalSpecsEl = document.getElementById('total-specs');
    const completedSpecsEl = document.getElementById('completed-specs');
    const assignedTasksEl = document.getElementById('assigned-tasks');
    
    // Statistiques sidebar
    const totalSpecsOverview = document.getElementById('total-specs-overview');
    const completedSpecsOverview = document.getElementById('completed-specs-overview');
    
    const totalSpecs = specifications.length;
    const completedSpecs = specifications.filter(spec => spec.status === 'completed').length;
    const totalAssignedTasks = specifications.reduce((total, spec) => {
        return total + (spec.tachesAssociees ? spec.tachesAssociees.length : 0);
    }, 0);
    
    // Mettre à jour la sidebar
    if (totalSpecsEl) totalSpecsEl.textContent = totalSpecs;
    if (completedSpecsEl) completedSpecsEl.textContent = completedSpecs;
    if (assignedTasksEl) assignedTasksEl.textContent = totalAssignedTasks;
    
    // Mettre à jour la vue d'ensemble
    if (totalSpecsOverview) totalSpecsOverview.textContent = totalSpecs;
    if (completedSpecsOverview) completedSpecsOverview.textContent = completedSpecs;
    
    console.log('📊 Stats updated:', { totalSpecs, completedSpecs, totalAssignedTasks });
}

// Filtrer les spécifications par domaine
function filterSpecifications(filter) {
    console.log('🔍 Filtering specifications by:', filter);
    
    const specCards = document.querySelectorAll('.spec-card');
    
    specCards.forEach(card => {
        const category = card.dataset.category;
        
        if (filter === 'all' || category === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log('✅ Filter applied:', filter);
}

// Vider le formulaire de spécification
function clearSpecificationForm() {
    console.log('🧹 Clearing specification form...');
    
    const titleEl = document.getElementById('spec-title');
    const domainEl = document.getElementById('spec-domain');
    const priorityEl = document.getElementById('spec-priority');
    const descriptionEl = document.getElementById('spec-description');
    const statusEl = document.getElementById('spec-status');
    const rangeValueEl = document.querySelector('.range-value');
    
    if (titleEl) titleEl.value = '';
    if (domainEl) domainEl.value = 'site-dev';
    if (priorityEl) priorityEl.value = '50';
    if (descriptionEl) descriptionEl.value = '';
    if (statusEl) statusEl.value = 'not-started';
    if (rangeValueEl) rangeValueEl.textContent = '50';
    
    console.log('✅ Form cleared successfully');
}

// Initialiser la gestion des spécifications
function initializeSpecifications() {
    console.log('🔧 Initializing specifications management...');
    
    // Load specifications CSS
    loadSpecificationCSS();
    
    loadSpecificationsFromStorage();
    updateSpecificationsList();
    updateTaskAssignmentSelects();
    updateSpecificationStats();
    
    // Ajouter les event listeners
    const submitBtn = document.getElementById('spec-submit-btn');
    if (submitBtn) {
        console.log('✅ Submit button found, adding click listener');
        submitBtn.onclick = addSpecification;
    } else {
        console.warn('⚠️ Submit button not found!');
    }
    
    // Vérifier que tous les éléments du formulaire sont présents
    const requiredElements = [
        'spec-title', 'spec-domain', 'spec-priority', 
        'spec-description', 'spec-status', 'specifications-list'
    ];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Element found: ${id}`);
        } else {
            console.warn(`⚠️ Element missing: ${id}`);
        }
    });
    
    console.log('✅ Specifications management initialized');
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================
// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeTaskSystem();
        initializeSpecifications();
    });
} else {
    initializeTaskSystem();
    initializeSpecifications();
}

// Function for testing priority tasks display (call from browser console)
function testPriorityTasks() {
    console.log('🧪 Testing priority tasks display...');
    console.log('📊 Current tasks:', tasks.length);
    console.log('🎯 Priority container:', document.getElementById('priority-tasks'));
    updatePriorityTasks();
    return {
        tasks: tasks,
        priorityContainer: document.getElementById('priority-tasks'),
        innerHTML: document.getElementById('priority-tasks')?.innerHTML
    };
}

// Function for diagnosing system state
function diagnosticSystem() {
    console.log('🔬 DIAGNOSTIC SYSTEM STATE');
    console.log('============================');
    console.log('📊 Tasks loaded:', tasks.length);
    console.log('📋 Specifications loaded:', specifications.length);
    console.log('🌐 Current URL:', window.location.href);
    console.log('📄 Document ready state:', document.readyState);
    
    // Check key DOM elements
    const keyElements = [
        'spec-submit-btn', 'spec-title', 'spec-domain', 
        'spec-priority', 'spec-description', 'spec-status',
        'specifications-list'
    ];
    
    console.log('🎯 DOM Elements:');
    keyElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`  ${id}: ${element ? '✅ Found' : '❌ Missing'}`);
    });
    
    // Check task assignment selects
    const selects = document.querySelectorAll('.task-assign-select');
    console.log(`🔽 Task assignment selects: ${selects.length} found`);
    
    // Check available functions
    const functions = [
        'addSpecification', 'editSpecification', 'updateSpecification',
        'deleteSpecification', 'assignTaskToSpecification'
    ];
    
    console.log('🔧 Available functions:');
    functions.forEach(funcName => {
        const func = window[funcName];
        console.log(`  ${funcName}: ${typeof func === 'function' ? '✅ Available' : '❌ Missing'}`);
    });
    
    return {
        tasksCount: tasks.length,
        specificationsCount: specifications.length,
        url: window.location.href,
        readyState: document.readyState,
        selectsCount: selects.length
    };
}

// Make functions available globally for debugging
window.testPriorityTasks = testPriorityTasks;
window.createDemoTasks = createDemoTasks;
window.addSpecification = addSpecification;
window.editSpecification = editSpecification;
window.updateSpecification = updateSpecification;
window.deleteSpecification = deleteSpecification;
window.updateSpecificationsList = updateSpecificationsList;
window.clearSpecificationForm = clearSpecificationForm;
window.initializeSpecifications = initializeSpecifications;
window.assignTaskToSpecification = assignTaskToSpecification;
window.unassignTaskFromSpecification = unassignTaskFromSpecification;
window.assignTaskFromSelectUI = assignTaskFromSelectUI;
window.unassignTaskFromSpecificationUI = unassignTaskFromSpecificationUI;
window.updateTaskAssignmentSelects = updateTaskAssignmentSelects;
window.updateSpecificationStats = updateSpecificationStats;
window.filterSpecifications = filterSpecifications;
window.diagnosticSystem = diagnosticSystem;
window.diagnosticSystem = diagnosticSystem;