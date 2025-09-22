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
        category: 'ui',
        description: 'Interface sombre avec palette horror professionnelle',
        priority: 95,
        status: 'completed',
        tachesAssociees: []
    },
    {
        id: 'gestion-taches',
        title: '📋 Système de Gestion des Tâches',
        category: 'features',
        description: 'CRUD complet avec sous-tâches hiérarchiques',
        priority: 98,
        status: 'completed',
        tachesAssociees: []
    },
    {
        id: 'dashboard-analytics',
        title: '📊 Tableau de Bord Analytics',
        category: 'features',
        description: 'Statistiques en temps réel et visualisations',
        priority: 85,
        status: 'completed',
        tachesAssociees: []
    },
    {
        id: 'performance-optim',
        title: '⚡ Optimisations Performance',
        category: 'performance',
        description: 'Application optimisée pour les performances',
        priority: 80,
        status: 'completed',
        tachesAssociees: []
    },
    {
        id: 'architecture-modulaire',
        title: '🏗️ Architecture Modulaire',
        category: 'architecture',
        description: 'Code organisé en modules réutilisables',
        priority: 90,
        status: 'completed',
        tachesAssociees: []
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

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
function formatDate(date) {
    if (!date) return 'Aucune';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
}

function calculateDaysRemaining(deadline) {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function getStatusText(status) {
    const statusMap = {
        'not-started': 'Pas commencé',
        'in-progress': 'En cours',
        'standby': 'Stand by',
        'completed': 'Terminé'
    };
    return statusMap[status] || status;
}

function getDomainText(domain) {
    const domainMap = {
        'kyf': 'KYF',
        'development': 'Développement',
        'design': 'Design',
        'marketing': 'Marketing',
        'research': 'Recherche'
    };
    return domainMap[domain] || domain;
}

function getCaracteristiqueText(caracteristiqueId) {
    if (!caracteristiqueId) return 'Aucune';
    
    const caracteristiqueMap = {
        'interface-horror': '🎨 Interface Horror',
        'gestion-taches': '📋 Gestion des Tâches',
        'dashboard-analytics': '📊 Analytics',
        'performance-optim': '⚡ Performance',
        'architecture-modulaire': '🏗️ Architecture'
    };
    return caracteristiqueMap[caracteristiqueId] || caracteristiqueId;
}

// ===========================================
// STORAGE FUNCTIONS
// ===========================================
function saveTasksToStorage() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(CONFIG.COUNTER_KEY, taskIdCounter.toString());
        console.log('✅ Tasks saved to storage');
    } catch (error) {
        console.error('❌ Error saving tasks:', error);
    }
}

function saveSpecificationsToStorage() {
    try {
        localStorage.setItem(CONFIG.SPECS_KEY, JSON.stringify(specifications));
        console.log('✅ Specifications saved to storage');
    } catch (error) {
        console.error('❌ Error saving specifications:', error);
    }
}

function loadTasksFromStorage() {
    try {
        const storedTasks = localStorage.getItem(CONFIG.STORAGE_KEY);
        const storedCounter = localStorage.getItem(CONFIG.COUNTER_KEY);
        
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            console.log('✅ Loaded tasks from storage:', tasks.length);
        }
        
        if (storedCounter) {
            taskIdCounter = parseInt(storedCounter);
            console.log('✅ Loaded task counter:', taskIdCounter);
        }
        
        return tasks;
    } catch (error) {
        console.error('❌ Error loading tasks:', error);
        return [];
    }
}

function loadSpecificationsFromStorage() {
    try {
        const storedSpecs = localStorage.getItem(CONFIG.SPECS_KEY);
        
        if (storedSpecs) {
            specifications = JSON.parse(storedSpecs);
            console.log('✅ Loaded specifications from storage:', specifications.length);
        } else {
            // Première fois : utiliser les spécifications prédéfinies
            specifications = [...CAHIER_DES_CHARGES_SPECS];
            saveSpecificationsToStorage();
            console.log('✅ Initialized specifications with defaults');
        }
        
        return specifications;
    } catch (error) {
        console.error('❌ Error loading specifications:', error);
        // En cas d'erreur, utiliser les spécifications par défaut
        specifications = [...CAHIER_DES_CHARGES_SPECS];
        return specifications;
    }
}

// ===========================================
// SUBTASK FUNCTIONS
// ===========================================
function addSubtask() {
    const input = document.getElementById('new-subtask-input');
    const subtasksList = document.getElementById('subtasks-list');
    
    if (!input || !subtasksList) {
        console.warn('⚠️ Subtask elements not found');
        return;
    }
    
    const text = input.value.trim();
    if (!text) {
        showNotification('Veuillez saisir le texte de la sous-tâche', 'error');
        return;
    }
    
    const subtaskId = 'subtask-' + Date.now();
    const subtaskElement = document.createElement('div');
    subtaskElement.className = 'subtask-item';
    subtaskElement.dataset.level = '0';
    subtaskElement.innerHTML = `
        <div class="subtask-content">
            <input type="checkbox" class="subtask-checkbox" id="${subtaskId}">
            <label for="${subtaskId}" class="subtask-text">${text}</label>
            <button type="button" class="remove-subtask-btn" onclick="removeSubtask(this)">×</button>
        </div>
    `;
    
    subtasksList.appendChild(subtaskElement);
    input.value = '';
    
    console.log('✅ Subtask added:', text);
}

function removeSubtask(button) {
    const subtaskItem = button.closest('.subtask-item');
    if (subtaskItem) {
        subtaskItem.remove();
        console.log('✅ Subtask removed');
    }
}

// ===========================================
// DASHBOARD FUNCTIONS
// ===========================================
function updateDashboard() {
    console.log('🐛 DEBUG: Updating dashboard with', tasks.length, 'tasks');
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'in-progress').length;
    const overdueTasks = tasks.filter(task => {
        if (!task.deadline) return false;
        const today = new Date();
        const deadline = new Date(task.deadline);
        return deadline < today && task.status !== 'completed';
    }).length;
    
    // Update counters
    const totalElement = document.getElementById('total-tasks');
    const completedElement = document.getElementById('completed-tasks');
    const pendingElement = document.getElementById('pending-tasks');
    const overdueElement = document.getElementById('overdue-tasks');
    
    if (totalElement) totalElement.textContent = totalTasks;
    if (completedElement) completedElement.textContent = completedTasks;
    if (pendingElement) pendingElement.textContent = pendingTasks;
    if (overdueElement) overdueElement.textContent = overdueTasks;
    
    // Update priority tasks
    updatePriorityTasks();
    
    // Update quick assignment dropdown
    updateQuickAssignmentTasks();
    
    console.log('✅ Dashboard updated:', { totalTasks, completedTasks, pendingTasks, overdueTasks });
}

function updatePriorityTasks() {
    console.log('🔄 Updating priority tasks...');
    const priorityContainer = document.getElementById('priority-tasks');
    if (!priorityContainer) {
        console.warn('⚠️ Priority tasks container not found');
        return;
    }
    
    // Get top 3 highest priority tasks that are not completed
    const priorityTasks = tasks
        .filter(task => task.status !== 'completed')
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 3);
    
    console.log('📊 Priority tasks found:', priorityTasks.length, priorityTasks.map(t => ({title: t.title, priority: t.priority})));
    
    if (priorityTasks.length === 0) {
        priorityContainer.innerHTML = '<p class="no-priority-tasks">Aucune tâche prioritaire</p>';
        return;
    }
    
    let html = '';
    priorityTasks.forEach((task, index) => {
        const daysRemaining = calculateDaysRemaining(task.deadline);
        
        // Déterminer la classe d'urgence
        let urgencyClass = '';
        if (daysRemaining !== null) {
            if (daysRemaining < 0) {
                urgencyClass = 'priority-overdue';
            } else if (daysRemaining <= 3) {
                urgencyClass = 'priority-urgent';
            } else if (daysRemaining <= 7) {
                urgencyClass = 'priority-warning';
            }
        }
        
        // Calculer le niveau de priorité pour le style
        let priorityLevel = '';
        if (task.priority >= 90) priorityLevel = 'critical';
        else if (task.priority >= 75) priorityLevel = 'high';
        else if (task.priority >= 60) priorityLevel = 'medium';
        else priorityLevel = 'normal';
        
        html += `
            <div class="priority-task-item-simple ${urgencyClass} priority-${priorityLevel}" data-task-id="${task.id}" onclick="scrollToTask(${task.id})">
                <div class="priority-task-rank">#${index + 1}</div>
                <div class="priority-task-title-simple">${task.title}</div>
                <div class="priority-badge priority-${priorityLevel}">${task.priority}</div>
            </div>
        `;
    });
    
    priorityContainer.innerHTML = html;
    console.log('✅ Priority tasks updated successfully with', priorityTasks.length, 'tasks');
    console.log('📝 Generated HTML:', html.substring(0, 200) + '...');
}

// Fonction pour faire défiler jusqu'à une tâche spécifique dans la liste
function scrollToTask(taskId) {
    console.log('🎯 Scrolling to task:', taskId);
    
    // Attendre un petit moment pour que l'affichage soit prêt
    setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            // Scroll smooth jusqu'à l'élément
            taskElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Ajouter un effet visuel temporaire
            taskElement.style.backgroundColor = 'rgba(163, 22, 33, 0.3)';
            taskElement.style.borderColor = 'var(--rouge-sang)';
            taskElement.style.transform = 'scale(1.02)';
            
            // Retirer l'effet après 2 secondes
            setTimeout(() => {
                taskElement.style.backgroundColor = '';
                taskElement.style.borderColor = '';
                taskElement.style.transform = '';
            }, 2000);
            
            console.log('✅ Scrolled to task successfully');
        } else {
            console.warn('⚠️ Task element not found in main list');
            showNotification('Tâche non trouvée dans la liste', 'warning');
        }
    }, 100);
}

function updateQuickAssignmentTasks() {
    const quickAssignSelect = document.getElementById('quick-assign-task');
    if (!quickAssignSelect) return;
    
    // Clear existing options except the first placeholder
    quickAssignSelect.innerHTML = '<option value="">Sélectionner une tâche...</option>';
    
    // Add tasks that are not completed
    const availableTasks = tasks.filter(task => task.status !== 'completed');
    
    availableTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = `${task.title} (${getStatusText(task.status)})`;
        quickAssignSelect.appendChild(option);
    });
    
    console.log('✅ Quick assignment dropdown updated with', availableTasks.length, 'tasks');
}

// ===========================================
// SPECIFICATIONS FUNCTIONS
// ===========================================
function assignTaskToSpecification(taskId, specId) {
    console.log('🐛 DEBUG: assignTaskToSpecification called', { taskId, specId });
    
    if (!taskId || !specId) {
        console.error('❌ TaskId or SpecId is missing');
        return false;
    }
    
    // Trouver la tâche
    const task = tasks.find(t => t.id == taskId);
    if (!task) {
        console.error('❌ Task not found:', taskId);
        return false;
    }
    
    // Trouver la spécification
    let spec = specifications.find(s => s.id === specId);
    if (!spec) {
        console.error('❌ Specification not found:', specId);
        return false;
    }
    
    // Retirer la tâche de toutes les autres spécifications d'abord
    specifications.forEach(s => {
        if (s.tachesAssociees && s.tachesAssociees.includes(taskId)) {
            s.tachesAssociees = s.tachesAssociees.filter(id => id != taskId);
        }
    });
    
    // Ajouter la tâche à la nouvelle spécification
    if (!spec.tachesAssociees) {
        spec.tachesAssociees = [];
    }
    
    if (!spec.tachesAssociees.includes(taskId)) {
        spec.tachesAssociees.push(taskId);
    }
    
    // Mettre à jour la tâche avec la nouvelle caractéristique
    task.caracteristique = specId;
    
    // Sauvegarder
    saveTasksToStorage();
    saveSpecificationsToStorage();
    
    console.log('✅ Task assigned to specification:', { taskId, specId });
    return true;
}

function unassignTaskFromSpecification(taskId, specId) {
    console.log('🐛 DEBUG: unassignTaskFromSpecification called', { taskId, specId });
    
    // Trouver la tâche
    const task = tasks.find(t => t.id == taskId);
    if (task) {
        task.caracteristique = '';
    }
    
    // Trouver la spécification et retirer la tâche
    const spec = specifications.find(s => s.id === specId);
    if (spec && spec.tachesAssociees) {
        spec.tachesAssociees = spec.tachesAssociees.filter(id => id != taskId);
    }
    
    // Sauvegarder
    saveTasksToStorage();
    saveSpecificationsToStorage();
    
    console.log('✅ Task unassigned from specification:', { taskId, specId });
    return true;
}

function updateSpecificationTasksDisplay(specId) {
    const container = document.getElementById(`tasks-${specId}`);
    if (!container) return;
    
    const spec = specifications.find(s => s.id === specId);
    if (!spec || !spec.tachesAssociees || spec.tachesAssociees.length === 0) {
        container.innerHTML = '<div class="empty-tasks-message">Aucune tâche assignée</div>';
        return;
    }
    
    let html = '';
    spec.tachesAssociees.forEach(taskId => {
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            html += `
                <div class="assigned-task-item">
                    <span class="assigned-task-title">${task.title}</span>
                    <span class="assigned-task-status status-${task.status}">${getStatusText(task.status)}</span>
                    <button class="unassign-btn" onclick="unassignTaskFromSpecificationUI('${taskId}', '${specId}')">
                        ×
                    </button>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

function updateTaskAssignmentSelects() {
    const selects = document.querySelectorAll('.task-assign-select');
    
    selects.forEach(select => {
        const specId = select.dataset.specId;
        const spec = specifications.find(s => s.id === specId);
        
        // Clear options
        select.innerHTML = '<option value="">Assigner une tâche existante...</option>';
        
        // Add available tasks (not assigned to this specification)
        const availableTasks = tasks.filter(task => {
            return !spec.tachesAssociees || !spec.tachesAssociees.includes(task.id);
        });
        
        availableTasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = `${task.title} (${getStatusText(task.status)})`;
            select.appendChild(option);
        });
    });
}

function updateAllSpecificationDisplays() {
    CAHIER_DES_CHARGES_SPECS.forEach(spec => {
        updateSpecificationTasksDisplay(spec.id);
    });
    updateTaskAssignmentSelects();
}

// UI Functions for specification management
function assignTaskFromSelectUI(specId) {
    const select = document.querySelector(`.task-assign-select[data-spec-id="${specId}"]`);
    if (!select || !select.value) {
        showNotification('Veuillez sélectionner une tâche', 'error');
        return;
    }
    
    const taskId = select.value;
    if (assignTaskToSpecification(taskId, specId)) {
        updateSpecificationTasksDisplay(specId);
        updateTaskAssignmentSelects();
        select.value = ''; // Reset select
        showNotification('Tâche assignée avec succès', 'success');
    } else {
        showNotification('Erreur lors de l\'assignation', 'error');
    }
}

function unassignTaskFromSpecificationUI(taskId, specId) {
    if (unassignTaskFromSpecification(taskId, specId)) {
        updateSpecificationTasksDisplay(specId);
        updateTaskAssignmentSelects();
        showNotification('Tâche désassignée avec succès', 'success');
    } else {
        showNotification('Erreur lors de la désassignation', 'error');
    }
}

// ===========================================
// QUICK ASSIGNMENT FUNCTIONALITY
// ===========================================
function handleQuickAssignment() {
    const taskSelect = document.getElementById('quick-assign-task');
    const userSelect = document.getElementById('quick-assign-user');
    
    if (!taskSelect || !userSelect) {
        console.warn('⚠️ Quick assignment elements not found');
        return;
    }
    
    const taskId = parseInt(taskSelect.value);
    const assignee = userSelect.value;
    
    if (!taskId || !assignee) {
        showNotification('Veuillez sélectionner une tâche et un assigné', 'error');
        return;
    }
    
    // Find and update the task
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        showNotification('Tâche non trouvée', 'error');
        return;
    }
    
    tasks[taskIndex].assignee = assignee;
    saveTasksToStorage();
    updateTasksList();
    updateDashboard();
    
    // Reset selects
    taskSelect.value = '';
    userSelect.value = '';
    
    showNotification(`Tâche assignée à ${assignee}`, 'success');
    console.log('✅ Task assigned:', taskId, 'to', assignee);
}

// ===========================================
// TASK FILTERING FUNCTIONALITY
// ===========================================
function setupTaskFiltering() {
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
}

function filterTasks(filter) {
    currentFilter = filter;
    updateTasksList();
}

function getFilteredTasks() {
    if (currentFilter === 'all') {
        return tasks;
    }
    
    return tasks.filter(task => task.status === currentFilter);
}

function calculateProgressFromSubtasks(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return 0;
    }
    
    const completedCount = subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
}

function createTaskFromForm() {
    console.log('🐛 DEBUG: createTaskFromForm started');
    
    try {
        // Get form elements
        const titleElement = document.getElementById('task-title');
        const deadlineElement = document.getElementById('task-deadline');
        const statusElement = document.getElementById('task-status');
        const domainElement = document.getElementById('task-domain');
        const conditionElement = document.getElementById('task-condition');
        const durationElement = document.getElementById('task-duration');
        const difficultyElement = document.getElementById('task-difficulty');
        const priorityElement = document.getElementById('task-priority');
        const assigneeElement = document.getElementById('task-assignee');
        const caracteristiqueElement = document.getElementById('task-caracteristique');
        
        // Validate required elements
        if (!titleElement || !deadlineElement) {
            throw new Error('Required form elements not found');
        }
        
        // Get values
        const title = titleElement.value.trim();
        const deadline = new Date(deadlineElement.value);
        
        if (!title) {
            throw new Error('Task title is required');
        }
        
        // Récupérer les sous-tâches
        const subtasks = [];
        const subtaskElements = document.querySelectorAll('.subtask-item');
        console.log('🐛 DEBUG: Found subtask elements:', subtaskElements.length);
        
        subtaskElements.forEach((element, index) => {
            // Essayer différents sélecteurs pour la compatibilité
            const textElement = element.querySelector('.subtask-label') || element.querySelector('.subtask-text');
            const checkboxElement = element.querySelector('.subtask-checkbox');
            
            if (textElement && checkboxElement) {
                const text = textElement.textContent || textElement.innerText || '';
                const checked = checkboxElement.checked;
                const level = parseInt(element.dataset.level) || 0;
                
                console.log('🐛 DEBUG: Processing subtask:', { text, checked, level });
                
                subtasks.push({
                    id: Date.now() + index,
                    text: text,
                    completed: checked,
                    level: level,
                    createdAt: new Date()
                });
            } else {
                console.warn('⚠️ Subtask element missing text or checkbox:', element);
            }
        });
        
        console.log('🐛 DEBUG: Collected subtasks:', subtasks);
        
        const task = {
            id: incrementTaskIdCounter(),
            title: title,
            deadline: deadline,
            status: statusElement ? statusElement.value : 'not-started',
            domain: domainElement ? domainElement.value : 'development',
            condition: conditionElement ? conditionElement.value : '',
            duration: durationElement ? durationElement.value : '1h',
            difficulty: difficultyElement ? parseInt(difficultyElement.value) : 5,
            priority: priorityElement ? parseInt(priorityElement.value) : 50,
            assignee: assigneeElement ? (assigneeElement.value || 'Non assigné') : 'Non assigné',
            caracteristique: caracteristiqueElement ? caracteristiqueElement.value : '',
            createdAt: new Date(),
            progress: calculateProgressFromSubtasks(subtasks),
            steps: [],
            subtasks: subtasks
        };
        
        console.log('🐛 DEBUG: Task created successfully with subtasks:', task);
        console.log('🐛 DEBUG: Subtasks detail:', task.subtasks);
        return task;
        
    } catch (error) {
        console.error('❌ ERROR in createTaskFromForm:', error);
        throw error;
    }
}

function addTask(task) {
    console.log('🐛 DEBUG: addTask called with:', task);
    console.log('🐛 DEBUG: Current tasks array length:', tasks.length);
    
    tasks.push(task);
    console.log('🐛 DEBUG: Task added. New tasks array length:', tasks.length);
    
    // Si la tâche a une caractéristique assignée, l'ajouter à la spécification
    if (task.caracteristique) {
        const spec = specifications.find(s => s.id === task.caracteristique);
        if (spec) {
            if (!spec.tachesAssociees) {
                spec.tachesAssociees = [];
            }
            if (!spec.tachesAssociees.includes(task.id)) {
                spec.tachesAssociees.push(task.id);
            }
            saveSpecificationsToStorage();
            console.log('🐛 DEBUG: Task linked to specification:', task.caracteristique);
            
            // Mettre à jour l'affichage des spécifications si on est sur la page cahier des charges
            if (document.getElementById('specifications-list')) {
                updateAllSpecificationDisplays();
            }
        }
    }
    
    saveTasksToStorage();
    console.log('🐛 DEBUG: Saved to storage successfully');
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
            domain: 'design',
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
            domain: 'development',
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
            domain: 'testing',
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
            domain: 'development',
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
    console.log('📍 Current tasks count:', tasks.length);
    
    // Load existing tasks and specifications
    loadTasksFromStorage();
    loadSpecificationsFromStorage();
    
    console.log('📍 After loading from storage, tasks count:', tasks.length);
    
    // If no tasks exist, create demo tasks
    if (tasks.length === 0) {
        console.log('🎭 No tasks found, creating demo tasks...');
        createDemoTasks();
    }
    
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
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.dataset.filter;
            
            // Update task list with filter
            updateTasksListWithFilter(filterValue);
            
            console.log('✅ Filter applied:', filterValue);
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

function updateTasksListWithFilter(filterValue) {
    console.log('🐛 DEBUG: updateTasksListWithFilter called with:', filterValue);
    
    const tasksListElement = document.getElementById('tasks-list');
    if (!tasksListElement) {
        console.warn('⚠️ Tasks list element not found');
        return;
    }
    
    let filteredTasks = tasks;
    
    // Apply filter
    if (filterValue && filterValue !== 'all') {
        filteredTasks = tasks.filter(task => task.status === filterValue);
    }
    
    if (filteredTasks.length === 0) {
        tasksListElement.innerHTML = '<p class="no-tasks">Aucune tâche pour ce filtre.</p>';
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
            console.log('🐛 DEBUG: Task', task.title, 'has subtasks:', task.subtasks);
        } else {
            console.log('🐛 DEBUG: Task', task.title, 'has no subtasks');
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
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function getSelectedTasks() {
    const checkboxes = document.querySelectorAll('.task-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function updateQuickAssignmentUI() {
    const selectedTasks = getSelectedTasks();
    const assignBtn = document.getElementById('assign-selected');
    
    if (assignBtn) {
        assignBtn.textContent = `Assigner (${selectedTasks.length})`;
        assignBtn.disabled = selectedTasks.length === 0;
    }
}

function editTask(taskId) {
    console.log('Edit task:', taskId);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        alert('Tâche non trouvée');
        return;
    }
    
    // Fill form with task data
    const form = document.getElementById('task-form');
    if (!form) {
        alert('Formulaire non trouvé');
        return;
    }
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
    
    // Fill form fields
    document.getElementById('task-title').value = task.title || '';
    
    // Format date for HTML date input (YYYY-MM-DD)
    let deadlineValue = '';
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        if (!isNaN(deadlineDate.getTime())) {
            // Format to YYYY-MM-DD for HTML date input
            deadlineValue = deadlineDate.toISOString().split('T')[0];
        }
    }
    document.getElementById('task-deadline').value = deadlineValue;
    
    document.getElementById('task-status').value = task.status || 'not-started';
    document.getElementById('task-domain').value = task.domain || 'development';
    document.getElementById('task-condition').value = task.condition || '';
    document.getElementById('task-duration').value = task.duration || '1h';
    document.getElementById('task-difficulty').value = task.difficulty || 5;
    document.getElementById('task-priority').value = task.priority || 50;
    document.getElementById('task-assignee').value = task.assignee || '';
    
    // Gestion du champ caractéristique
    const caracteristiqueElement = document.getElementById('task-caracteristique');
    if (caracteristiqueElement) {
        caracteristiqueElement.value = task.caracteristique || '';
    }
    
    // Update range displays
    updateRangeValues();
    
    // Store task ID for update instead of create
    form.dataset.editingTaskId = taskId;
    
    // Change button text
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = `
            <span>Mettre à jour la tâche</span>
            <div class="blood-drip"></div>
        `;
    }
    
    console.log('✅ Task editing form populated for task:', task.title);
}

function deleteTask(taskId) {
    console.log('Delete task:', taskId);
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        updateTasksList();
        updateDashboard();
    }
}

function showTaskDetails(taskId) {
    console.log('Show task details:', taskId);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        alert('Tâche non trouvée');
        return;
    }
    
    const modal = document.getElementById('task-modal');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBody) {
        // Fallback to alert if modal not available
        let details = `
Titre: ${task.title}
Domaine: ${getDomainText(task.domain)}
Deadline: ${formatDate(task.deadline)}
Priorité: ${task.priority}/100
Difficulté: ${task.difficulty}/10
Statut: ${getStatusText(task.status)}
Assigné à: ${task.assignee}
        `;
        
        if (task.condition) {
            details += `\nCondition: ${task.condition}`;
        }
        
        if (task.subtasks && task.subtasks.length > 0) {
            details += '\n\nSous-tâches:';
            task.subtasks.forEach((subtask, index) => {
                details += `\n- ${subtask.text || subtask.title} (${subtask.completed ? 'Terminée' : 'En cours'})`;
            });
        }
        
        alert(details);
        return;
    }
    
    // Build detailed modal content
    let subtasksHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        const progressPercent = Math.round((completedSubtasks / task.subtasks.length) * 100);
        
        subtasksHtml = `
            <div class="task-detail-section">
                <h4>Sous-tâches (${completedSubtasks}/${task.subtasks.length} terminées)</h4>
                <div class="subtasks-progress-container">
                    <div class="progress-bar-detail">
                        <div class="progress-fill-detail" style="width: ${progressPercent}%"></div>
                    </div>
                    <span class="progress-percent-detail">${progressPercent}%</span>
                </div>
                <ul class="subtasks-detail-list">
                    ${task.subtasks.map((subtask, index) => `
                        <li class="${subtask.completed ? 'completed' : 'pending'}">
                            <input type="checkbox" 
                                   id="subtask-modal-${index}" 
                                   class="subtask-modal-checkbox"
                                   ${subtask.completed ? 'checked' : ''}
                                   onchange="toggleSubtaskInModal(${task.id}, ${index})">
                            <label for="subtask-modal-${index}" class="subtask-modal-label">
                                ${subtask.text || subtask.title}
                            </label>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    const daysRemaining = calculateDaysRemaining(task.deadline);
    let deadlineInfo = formatDate(task.deadline);
    if (daysRemaining !== null) {
        if (daysRemaining > 0) {
            deadlineInfo += ` (dans ${daysRemaining} jours)`;
        } else if (daysRemaining === 0) {
            deadlineInfo += ' (aujourd\'hui)';
        } else {
            deadlineInfo += ` (en retard de ${Math.abs(daysRemaining)} jours)`;
        }
    }
    
    modalBody.innerHTML = `
        <h3 class="task-modal-title">${task.title}</h3>
        <div class="task-detail-grid">
            <div class="task-detail-section">
                <h4>Informations générales</h4>
                <p><strong>Domaine:</strong> ${getDomainText(task.domain)}</p>
                <p><strong>Statut:</strong> <span class="status-${task.status}">${getStatusText(task.status)}</span></p>
                <p><strong>Deadline:</strong> ${deadlineInfo}</p>
                <p><strong>Assigné à:</strong> ${task.assignee}</p>
            </div>
            
            <div class="task-detail-section">
                <h4>Évaluation</h4>
                <p><strong>Priorité:</strong> ${task.priority}/100</p>
                <p><strong>Difficulté:</strong> ${task.difficulty}/10</p>
                <p><strong>Durée estimée:</strong> ${task.duration}</p>
            </div>
            
            ${task.condition ? `
                <div class="task-detail-section">
                    <h4>Condition</h4>
                    <p>${task.condition}</p>
                </div>
            ` : ''}
            
            ${subtasksHtml}
        </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
    
    // Setup close functionality
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
    };
}

// Fonction pour basculer l'état d'une sous-tâche depuis la modal
function toggleSubtaskInModal(taskId, subtaskIndex) {
    console.log('🐛 DEBUG: toggleSubtaskInModal called with:', taskId, subtaskIndex);
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) {
        console.error('❌ Task or subtask not found');
        return;
    }
    
    // Basculer l'état de la sous-tâche
    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    
    // Recalculer le pourcentage de progression
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const progressPercent = Math.round((completedSubtasks / task.subtasks.length) * 100);
    
    // Mettre à jour l'affichage dans la modal
    const progressBar = document.querySelector('.progress-fill-detail');
    const progressPercentElement = document.querySelector('.progress-percent-detail');
    const subtaskCountHeader = document.querySelector('.task-detail-section h4');
    
    if (progressBar) {
        progressBar.style.width = progressPercent + '%';
    }
    
    if (progressPercentElement) {
        progressPercentElement.textContent = progressPercent + '%';
    }
    
    if (subtaskCountHeader) {
        subtaskCountHeader.textContent = `Sous-tâches (${completedSubtasks}/${task.subtasks.length} terminées)`;
    }
    
    // Mettre à jour la classe de la ligne
    const listItem = document.querySelector(`#subtask-modal-${subtaskIndex}`).closest('li');
    if (listItem) {
        listItem.className = task.subtasks[subtaskIndex].completed ? 'completed' : 'pending';
    }
    
    // Sauvegarder les modifications
    saveTasksToStorage();
    
    // Mettre à jour la liste des tâches en arrière-plan
    updateTasksList();
    updateDashboard();
    
    console.log('✅ Subtask toggled successfully');
}    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    console.log('✅ Task details modal opened for:', task.title);
}

function calculateDaysRemaining(deadline) {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

function formatDate(dateString) {
    if (!dateString) return 'Non définie';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusText(status) {
    const statusMap = {
        'not-started': 'Non commencée',
        'in-progress': 'En cours',
        'completed': 'Terminée',
        'blocked': 'Bloquée'
    };
    return statusMap[status] || status;
}

function getDomainText(domain) {
    const domainMap = {
        'frontend': 'Frontend',
        'backend': 'Backend',
        'design': 'Design',
        'testing': 'Tests',
        'deployment': 'Déploiement',
        'documentation': 'Documentation',
        'research': 'Recherche',
        'other': 'Autre'
    };
    return domainMap[domain] || domain;
}

// ===========================================
// AUTO-INITIALIZATION
// ===========================================
// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTaskSystem);
} else {
    initializeTaskSystem();
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

// Make functions available globally for debugging
window.testPriorityTasks = testPriorityTasks;
window.createDemoTasks = createDemoTasks;