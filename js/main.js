// ===========================================
// PROJET SILEX - GESTIONNAIRE DE TÂCHES
// ===========================================

// Variables globales
let tasks = [];
let currentFilter = 'all';
let taskIdCounter = 1;

// Système audio
let audioContext = null;
let audioEnabled = false;
let audioInitialized = false;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeAudio();
    initializeAdvancedAnimations();
    initializePerformanceOptimizations();
});

// ===========================================
// INITIALISATION
// ===========================================
function initializeApp() {
    setupEventListeners();
    setupCursorTrail();
    loadTasksFromStorage();
    updateTasksList();
    updateRangeValues();
}

// ===========================================
// GESTION DES ÉVÉNEMENTS
// ===========================================
function setupEventListeners() {
    // Navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            switchPage(page);
            updateActiveNavButton(btn);
        });
    });

    // Formulaire de tâche
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }

    // Sliders de difficulté et priorité
    const difficultyRange = document.getElementById('task-difficulty');
    const priorityRange = document.getElementById('task-priority');
    
    if (difficultyRange) {
        difficultyRange.addEventListener('input', updateRangeValues);
    }
    if (priorityRange) {
        priorityRange.addEventListener('input', updateRangeValues);
    }

    // Filtres de tâches
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.getAttribute('data-filter');
            updateActiveFilterButton(btn);
            updateTasksList();
        });
    });

    // Modal
    const modal = document.getElementById('task-modal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Gestion des sous-tâches
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    const newSubtaskInput = document.getElementById('new-subtask-input');
    
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', addSubtask);
    }
    
    if (newSubtaskInput) {
        newSubtaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
            }
        });
    }

    // Bouton audio
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
    }
}

// ===========================================
// EFFET DE TRAÎNÉE DU CURSEUR
// ===========================================
function setupCursorTrail() {
    const trail = document.querySelector('.cursor-trail');
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        trail.style.opacity = '0.7';
    });

    document.addEventListener('mouseleave', () => {
        trail.style.opacity = '0';
    });

    function updateTrail() {
        const dx = mouseX - trailX;
        const dy = mouseY - trailY;
        
        trailX += dx * 0.1;
        trailY += dy * 0.1;
        
        trail.style.left = trailX - 10 + 'px';
        trail.style.top = trailY - 10 + 'px';
        
        requestAnimationFrame(updateTrail);
    }
    
    updateTrail();
}

// ===========================================
// NAVIGATION ENTRE PAGES
// ===========================================
function switchPage(pageId) {
    // Masquer toutes les pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Afficher la page sélectionnée
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function updateActiveNavButton(activeBtn) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function updateActiveFilterButton(activeBtn) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

// ===========================================
// GESTION DES VALEURS DES SLIDERS
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

// ===========================================
// GESTION DES TÂCHES
// ===========================================
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const task = createTaskFromForm(formData);
    
    addTask(task);
    e.target.reset();
    updateRangeValues();
    updateTasksList();
    
    // Afficher un feedback visuel
    showNotification('Tâche créée avec succès !', 'success');
}

function createTaskFromForm(formData) {
    const deadline = new Date(document.getElementById('task-deadline').value);
    
    // Récupérer les sous-tâches
    const subtasks = [];
    const subtaskElements = document.querySelectorAll('.subtask-item');
    subtaskElements.forEach((element, index) => {
        const text = element.querySelector('.subtask-text').textContent;
        const checked = element.querySelector('.subtask-checkbox').checked;
        const level = parseInt(element.dataset.level) || 0;
        
        subtasks.push({
            id: Date.now() + index,
            text: text,
            completed: checked,
            level: level,
            createdAt: new Date()
        });
    });
    
    return {
        id: taskIdCounter++,
        title: document.getElementById('task-title').value,
        deadline: deadline,
        status: document.getElementById('task-status').value,
        domain: document.getElementById('task-domain').value,
        condition: document.getElementById('task-condition').value,
        duration: document.getElementById('task-duration').value,
        difficulty: parseInt(document.getElementById('task-difficulty').value),
        priority: parseInt(document.getElementById('task-priority').value),
        assignee: document.getElementById('task-assignee').value || 'Non assigné',
        createdAt: new Date(),
        progress: calculateProgressFromSubtasks(subtasks),
        steps: [],
        subtasks: subtasks
    };
}

function calculateProgressFromSubtasks(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return 0;
    }
    
    const completedCount = subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
}

function calculateInitialProgress(status) {
    switch(status) {
        case 'not-started': return 0;
        case 'in-progress': return 25;
        case 'standby': return 50;
        case 'completed': return 100;
        default: return 0;
    }
}

function addTask(task) {
    tasks.push(task);
    saveTasksToStorage();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage();
    updateTasksList();
    showNotification('Tâche supprimée');
}

function updateTask(taskId, updates) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        saveTasksToStorage();
        updateTasksList();
    }
}

// ===========================================
// GESTION DES SOUS-TÂCHES
// ===========================================
function addSubtask() {
    const input = document.getElementById('new-subtask-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    const subtasksList = document.getElementById('subtasks-list');
    const subtaskElement = createSubtaskElement({
        id: Date.now(),
        text: text,
        completed: false,
        level: 0
    });
    
    subtasksList.appendChild(subtaskElement);
    input.value = '';
}

function createSubtaskElement(subtask) {
    const div = document.createElement('div');
    div.className = `subtask-item level-${subtask.level}`;
    div.dataset.level = subtask.level;
    div.dataset.id = subtask.id;
    
    div.innerHTML = `
        <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
        <span class="subtask-text">${subtask.text}</span>
        <div class="subtask-actions">
            <button class="subtask-btn indent-btn" title="Indenter">→</button>
            <button class="subtask-btn outdent-btn" title="Désindenter">←</button>
            <button class="subtask-btn delete-btn" title="Supprimer">×</button>
        </div>
    `;
    
    // Event listeners
    const checkbox = div.querySelector('.subtask-checkbox');
    checkbox.addEventListener('change', () => {
        subtask.completed = checkbox.checked;
        div.classList.toggle('completed', checkbox.checked);
    });
    
    const indentBtn = div.querySelector('.indent-btn');
    indentBtn.addEventListener('click', () => {
        if (subtask.level < 2) {
            subtask.level++;
            div.className = `subtask-item level-${subtask.level}`;
            div.dataset.level = subtask.level;
        }
    });
    
    const outdentBtn = div.querySelector('.outdent-btn');
    outdentBtn.addEventListener('click', () => {
        if (subtask.level > 0) {
            subtask.level--;
            div.className = `subtask-item level-${subtask.level}`;
            div.dataset.level = subtask.level;
        }
    });
    
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        div.remove();
    });
    
    if (subtask.completed) {
        div.classList.add('completed');
    }
    
    return div;
}

function loadSubtasksInForm(subtasks) {
    const subtasksList = document.getElementById('subtasks-list');
    if (!subtasksList || !subtasks) return;
    
    subtasksList.innerHTML = '';
    subtasks.forEach(subtask => {
        const subtaskElement = createSubtaskElement(subtask);
        subtasksList.appendChild(subtaskElement);
    });
}

function updateTaskProgress(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    
    const newProgress = calculateProgressFromSubtasks(task.subtasks);
    updateTask(taskId, { progress: newProgress });
}

// ===========================================
// AFFICHAGE DES TÂCHES
// ===========================================
function updateTasksList() {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    const filteredTasks = filterTasks(tasks, currentFilter);
    const sortedTasks = sortTasksByPriority(filteredTasks);
    
    tasksList.innerHTML = '';
    
    if (sortedTasks.length === 0) {
        tasksList.innerHTML = '<div class="no-tasks">Aucune tâche trouvée</div>';
        return;
    }
    
    sortedTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

function filterTasks(tasks, filter) {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
}

function sortTasksByPriority(tasks) {
    return [...tasks].sort((a, b) => {
        // Trier par priorité (plus haut = plus prioritaire)
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        // En cas d'égalité, trier par deadline
        return new Date(a.deadline) - new Date(b.deadline);
    });
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-card breathing';
    taskDiv.setAttribute('data-task-id', task.id);
    
    const daysRemaining = calculateDaysRemaining(task.deadline);
    const statusClass = `status-${task.status}`;
    const statusText = getStatusText(task.status);
    
    taskDiv.innerHTML = `
        <div class="task-header">
            <h4 class="task-title">${task.title}</h4>
            <span class="task-status ${statusClass}">${statusText}</span>
        </div>
        
        <div class="task-details">
            <div class="task-detail">
                <span><strong>Deadline:</strong></span>
                <span class="${daysRemaining < 0 ? 'overdue' : daysRemaining <= 3 ? 'urgent' : ''}">${formatDate(task.deadline)} (${daysRemaining >= 0 ? daysRemaining + ' jours' : 'En retard'})</span>
            </div>
            <div class="task-detail">
                <span><strong>Domaine:</strong></span>
                <span>${getDomainText(task.domain)}</span>
            </div>
            <div class="task-detail">
                <span><strong>Durée:</strong></span>
                <span>${task.duration}</span>
            </div>
            <div class="task-detail">
                <span><strong>Difficulté:</strong></span>
                <span>${task.difficulty}/10</span>
            </div>
            <div class="task-detail">
                <span><strong>Priorité:</strong></span>
                <span>${task.priority}/100</span>
            </div>
            <div class="task-detail">
                <span><strong>Assigné à:</strong></span>
                <span>${task.assignee}</span>
            </div>
        </div>
        
        ${task.condition ? `<div class="task-condition"><strong>Condition:</strong> ${task.condition}</div>` : ''}
        
        ${task.subtasks && task.subtasks.length > 0 ? `
        <div class="task-subtasks-preview">
            <strong>Sous-tâches (${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}):</strong>
            <div class="subtasks-mini-list">
                ${task.subtasks.slice(0, 3).map(subtask => `
                    <div class="subtask-mini ${subtask.completed ? 'completed' : ''}">
                        <span class="subtask-mini-checkbox">${subtask.completed ? '✓' : '○'}</span>
                        <span class="subtask-mini-text">${subtask.text}</span>
                    </div>
                `).join('')}
                ${task.subtasks.length > 3 ? `<div class="subtasks-more">... et ${task.subtasks.length - 3} autres</div>` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="task-progress">
            <div class="progress-info">
                <span>Progression: ${task.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${task.progress}%"></div>
            </div>
        </div>
        
        <div class="task-actions">
            <button class="action-btn edit-btn" onclick="editTask(${task.id})">✏️ Modifier</button>
            <button class="action-btn delete-btn" onclick="confirmDeleteTask(${task.id})">🗑️ Supprimer</button>
            <button class="action-btn details-btn" onclick="showTaskDetails(${task.id})">👁️ Détails</button>
        </div>
    `;
    
    return taskDiv;
}

// ===========================================
// UTILITAIRES DE DATES ET FORMATAGE
// ===========================================
function calculateDaysRemaining(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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

// ===========================================
// MODAL ET DÉTAILS DE TÂCHE
// ===========================================
function showTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const modal = document.getElementById('task-modal');
    const modalBody = document.getElementById('modal-body');
    
    // Générer l'HTML des sous-tâches
    const subtasksHTML = task.subtasks && task.subtasks.length > 0 ? `
        <div class="detail-row">
            <strong>Sous-tâches (${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}):</strong>
            <div class="modal-subtasks-list">
                ${task.subtasks.map(subtask => `
                    <div class="modal-subtask-item level-${subtask.level} ${subtask.completed ? 'completed' : ''}">
                        <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                               onchange="toggleSubtaskInModal(${task.id}, ${subtask.id})" 
                               class="modal-subtask-checkbox">
                        <span class="modal-subtask-text">${subtask.text}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    modalBody.innerHTML = `
        <h2>Détails de la tâche</h2>
        <div class="task-details-full">
            <h3>${task.title}</h3>
            <div class="detail-row">
                <strong>Statut:</strong> <span class="task-status ${`status-${task.status}`}">${getStatusText(task.status)}</span>
            </div>
            <div class="detail-row">
                <strong>Deadline:</strong> ${formatDate(task.deadline)} (${calculateDaysRemaining(task.deadline)} jours restants)
            </div>
            <div class="detail-row">
                <strong>Domaine:</strong> ${getDomainText(task.domain)}
            </div>
            <div class="detail-row">
                <strong>Durée estimée:</strong> ${task.duration}
            </div>
            <div class="detail-row">
                <strong>Difficulté:</strong> ${task.difficulty}/10
            </div>
            <div class="detail-row">
                <strong>Priorité:</strong> ${task.priority}/100
            </div>
            <div class="detail-row">
                <strong>Assigné à:</strong> ${task.assignee}
            </div>
            ${task.condition ? `<div class="detail-row"><strong>Condition:</strong> ${task.condition}</div>` : ''}
            ${subtasksHTML}
            <div class="detail-row">
                <strong>Créée le:</strong> ${formatDate(task.createdAt)}
            </div>
            
            <div class="progress-section">
                <h4>Progression: ${task.progress}%</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${task.progress}%"></div>
                </div>
                
                ${task.subtasks && task.subtasks.length > 0 ? 
                    '<p><em>Progression automatique basée sur les sous-tâches</em></p>' : 
                    `<div class="progress-controls">
                        <button onclick="updateTaskProgress(${task.id}, ${Math.max(0, task.progress - 25)})">-25%</button>
                        <button onclick="updateTaskProgress(${task.id}, ${Math.min(100, task.progress + 25)})">+25%</button>
                    </div>`
                }
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function updateTaskProgress(taskId, newProgress) {
    updateTask(taskId, { progress: newProgress });
    showTaskDetails(taskId); // Refresh modal
}

function toggleSubtaskInModal(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;
    
    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;
    
    subtask.completed = !subtask.completed;
    
    // Animation spéciale si la sous-tâche est complétée
    if (subtask.completed) {
        const subtaskElement = document.querySelector(`[data-id="${subtaskId}"]`);
        if (subtaskElement) {
            animateTaskCompletion(subtaskElement);
        }
    }
    
    // Recalculer la progression
    const newProgress = calculateProgressFromSubtasks(task.subtasks);
    updateTask(taskId, { progress: newProgress, subtasks: task.subtasks });
    
    // Actualiser la modal
    showTaskDetails(taskId);
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Remplir le formulaire avec les données de la tâche
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-deadline').value = task.deadline.toISOString().split('T')[0];
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-domain').value = task.domain;
    document.getElementById('task-condition').value = task.condition || '';
    document.getElementById('task-duration').value = task.duration;
    document.getElementById('task-difficulty').value = task.difficulty;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-assignee').value = task.assignee;
    
    // Charger les sous-tâches dans le formulaire
    if (task.subtasks) {
        loadSubtasksInForm(task.subtasks);
    }
    
    updateRangeValues();
    
    // Supprimer la tâche existante
    deleteTask(taskId);
    
    // Faire défiler vers le formulaire
    document.querySelector('.task-form-container').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Tâche chargée pour modification');
}

function confirmDeleteTask(taskId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        deleteTask(taskId);
    }
}

// ===========================================
// STOCKAGE LOCAL
// ===========================================
function saveTasksToStorage() {
    localStorage.setItem('silexTasks', JSON.stringify(tasks));
    localStorage.setItem('silexTaskCounter', taskIdCounter.toString());
}

function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('silexTasks');
    const storedCounter = localStorage.getItem('silexTaskCounter');
    
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        // Convertir les dates stockées en objets Date et vérifier la compatibilité
        tasks.forEach(task => {
            task.deadline = new Date(task.deadline);
            task.createdAt = new Date(task.createdAt);
            
            // Assurer la compatibilité avec les anciennes tâches
            if (!task.subtasks) {
                task.subtasks = [];
            }
            
            // Recalculer la progression si des sous-tâches existent
            if (task.subtasks.length > 0) {
                task.progress = calculateProgressFromSubtasks(task.subtasks);
            }
        });
    }
    
    if (storedCounter) {
        taskIdCounter = parseInt(storedCounter);
    }
}

// ===========================================
// NOTIFICATIONS
// ===========================================
function showNotification(message, type = 'info') {
    // Jouer le son approprié
    if (type === 'success' || message.includes('créée') || message.includes('assignée')) {
        playSound('complete');
    } else if (type === 'error' || message.includes('Veuillez')) {
        playSound('error');
    } else {
        playSound('notification');
    }
    
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'notification breathing';
    notification.textContent = message;
    
    // Couleur basée sur le type
    const colors = {
        success: 'linear-gradient(45deg, var(--rouge-sang) 0%, var(--rouge-sang-clair) 100%)',
        error: 'linear-gradient(45deg, #8B0000 0%, #FF4444 100%)',
        info: 'linear-gradient(45deg, var(--pourpre-sombre) 0%, var(--rouge-sang) 100%)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animation de sortie et suppression
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===========================================
// FONCTIONS UTILITAIRES POUR LE CSS
// ===========================================

// Ajout de styles dynamiques pour les éléments créés en JS
const style = document.createElement('style');
style.textContent = `
    .task-actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-lg);
        flex-wrap: wrap;
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-secondary);
    }
    
    .action-btn {
        background: var(--background-secondary);
        color: var(--blanc-os);
        border: 1px solid var(--border-secondary);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: var(--text-xs);
        font-weight: 500;
        transition: var(--transition-normal);
        flex: 1;
        min-width: 100px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        position: relative;
        overflow: hidden;
    }
    
    .action-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.3s ease;
    }
    
    .action-btn:hover::before {
        left: 100%;
    }
    
    .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }
    
    .edit-btn:hover { 
        background: linear-gradient(135deg, var(--vert-maladif) 0%, var(--vert-toxique) 100%);
        border-color: var(--vert-maladif);
    }
    .delete-btn:hover { 
        background: linear-gradient(135deg, var(--rouge-sang) 0%, var(--rouge-sang-clair) 100%);
        border-color: var(--rouge-sang);
    }
    .details-btn:hover { 
        background: linear-gradient(135deg, var(--pourpre-sombre) 0%, var(--pourpre-fade) 100%);
        border-color: var(--pourpre-sombre);
    }
    
    .no-tasks {
        text-align: center;
        color: var(--gris-clair);
        font-style: italic;
        padding: var(--spacing-3xl);
        font-size: var(--text-lg);
        background: var(--background-secondary);
        border-radius: var(--radius-lg);
        border: 1px dashed var(--border-secondary);
    }
    
    .task-condition {
        margin: var(--spacing-lg) 0;
        padding: var(--spacing-md);
        background: var(--noir-profond);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        border-left: 4px solid var(--rouge-sang);
        line-height: 1.6;
    }
    
    .urgent { 
        color: var(--rouge-sang) !important; 
        font-weight: 600;
        position: relative;
    }
    
    .urgent::after {
        content: '⚠️';
        margin-left: var(--spacing-xs);
    }
    
    .overdue { 
        color: var(--rouge-sang-clair) !important; 
        font-weight: 600;
        animation: pulse 2s infinite;
    }
    
    .task-details-full {
        color: var(--blanc-os);
        line-height: 1.6;
    }
    
    .task-details-full h3 {
        color: var(--rouge-sang);
        font-family: var(--font-title);
        font-size: var(--text-2xl);
        font-weight: 500;
        margin-bottom: var(--spacing-lg);
        text-align: center;
    }
    
    .detail-row {
        margin: var(--spacing-md) 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) 0;
        border-bottom: 1px solid var(--border-secondary);
    }
    
    .detail-row:last-child {
        border-bottom: none;
    }
    
    .detail-row strong {
        color: var(--gris-clair);
        font-size: var(--text-sm);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
    }
    
    .progress-section {
        margin-top: var(--spacing-xl);
        padding-top: var(--spacing-lg);
        border-top: 2px solid var(--border-secondary);
    }
    
    .progress-section h4 {
        color: var(--blanc-os);
        font-family: var(--font-title);
        font-size: var(--text-lg);
        font-weight: 500;
        margin-bottom: var(--spacing-md);
    }
    
    .progress-controls {
        display: flex;
        gap: var(--spacing-md);
        margin-top: var(--spacing-lg);
        justify-content: center;
    }
    
    .progress-controls button {
        background: linear-gradient(135deg, var(--rouge-sang) 0%, var(--rouge-sang-clair) 100%);
        color: var(--blanc-os);
        border: none;
        padding: var(--spacing-sm) var(--spacing-lg);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: var(--transition-normal);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: var(--text-sm);
    }
    
    .progress-controls button:hover {
        box-shadow: var(--shadow-horror);
        transform: translateY(-1px);
    }
    
    .progress-info {
        margin-bottom: var(--spacing-sm);
        font-weight: 500;
        color: var(--gris-clair);
        font-size: var(--text-sm);
    }
    
    .notification {
        font-family: var(--font-body) !important;
        font-weight: 500 !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid var(--rouge-sang) !important;
    }
`;
document.head.appendChild(style);

// ===========================================
// DONNÉES DE DÉMONSTRATION
// ===========================================
function createDemoTasks() {
    if (tasks.length === 0) {
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
                priority: 85,
                assignee: 'Designer Principal',
                createdAt: new Date(),
                progress: 40,
                steps: [],
                subtasks: [
                    { id: 1001, text: "Créer wireframes des pages principales", completed: true, level: 0 },
                    { id: 1002, text: "Définir la palette de couleurs horror", completed: true, level: 0 },
                    { id: 1003, text: "Concevoir les composants de base", completed: false, level: 0 },
                    { id: 1004, text: "Boutons et inputs", completed: false, level: 1 },
                    { id: 1005, text: "Cartes et modales", completed: false, level: 1 },
                    { id: 1006, text: "Tester l'accessibilité", completed: false, level: 0 }
                ]
            },
            {
                id: taskIdCounter++,
                title: "Implémentation du système de sauvegarde",
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
                status: 'not-started',
                domain: 'development',
                condition: 'Utiliser localStorage avec fallback',
                duration: '2d',
                difficulty: 4,
                priority: 92,
                assignee: 'Développeur Backend',
                createdAt: new Date(),
                progress: 0,
                steps: [],
                subtasks: [
                    { id: 2001, text: "Analyser les besoins de stockage", completed: false, level: 0 },
                    { id: 2002, text: "Implémenter localStorage", completed: false, level: 0 },
                    { id: 2003, text: "Ajouter système de backup", completed: false, level: 0 },
                    { id: 2004, text: "Tests de récupération", completed: false, level: 0 }
                ]
            },
            {
                id: taskIdCounter++,
                title: "Tests utilisateur et feedback",
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
                status: 'standby',
                domain: 'research',
                condition: 'Minimum 10 utilisateurs testeurs',
                duration: '1w',
                difficulty: 3,
                priority: 60,
                assignee: 'UX Researcher',
                createdAt: new Date(),
                progress: 75,
                steps: [],
                subtasks: [
                    { id: 3001, text: "Recruter des testeurs", completed: true, level: 0 },
                    { id: 3002, text: "Préparer le protocole de test", completed: true, level: 0 },
                    { id: 3003, text: "Organiser les sessions", completed: true, level: 0 },
                    { id: 3004, text: "Analyser les résultats", completed: false, level: 0 }
                ]
            }
        ];
        
        // Recalculer les progressions basées sur les sous-tâches
        demoTasks.forEach(task => {
            if (task.subtasks) {
                task.progress = calculateProgressFromSubtasks(task.subtasks);
            }
        });
        
        tasks = demoTasks;
        saveTasksToStorage();
        updateTasksList();
    }
}

// Créer des tâches de démonstration si aucune tâche n'existe
setTimeout(() => {
    if (tasks.length === 0) {
        createDemoTasks();
    }
}, 1000);

// ===========================================
// SYSTÈME AUDIO IMMERSIF
// ===========================================

// Initialiser le système audio (optimisé)
function initializeAudio() {
    // Initialiser seulement après la première interaction utilisateur
    document.addEventListener('click', () => {
        if (!audioInitialized) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioInitialized = true;
                
                // Reprendre le contexte audio
                audioContext.resume();
                
                // Ajouter les event listeners pour les sons d'interaction
                addAudioInteractionListeners();
                
                // Son de fond ambiant (très subtil)
                if (audioEnabled) {
                    startAmbientSound();
                }
            } catch (error) {
                console.warn('Audio non supporté:', error);
                audioInitialized = false;
            }
        }
    }, { once: true });
}

// Activer/Désactiver l'audio
function toggleAudio() {
    audioEnabled = !audioEnabled;
    const audioBtn = document.getElementById('audio-toggle');
    const audioIcon = audioBtn?.querySelector('.audio-icon');
    
    if (audioEnabled) {
        audioBtn?.classList.add('active');
        if (audioIcon) audioIcon.textContent = '🔊';
        playSound('activate');
        startAmbientSound();
    } else {
        audioBtn?.classList.remove('active');
        audioBtn?.classList.add('muted');
        if (audioIcon) audioIcon.textContent = '🔇';
        stopAmbientSound();
    }
    
    // Sauvegarder la préférence
    localStorage.setItem('silexAudioEnabled', audioEnabled.toString());
}

// Jouer un son spécifique
function playSound(type, options = {}) {
    if (!audioEnabled || !audioInitialized || !audioContext) return;

    try {
        switch (type) {
            case 'click':
                playClickSound(options);
                break;
            case 'hover':
                playHoverSound(options);
                break;
            case 'complete':
                playCompleteSound(options);
                break;
            case 'error':
                playErrorSound(options);
                break;
            case 'heartbeat':
                playHeartbeatSound(options);
                break;
            case 'breathing':
                playBreathingSound(options);
                break;
            case 'activate':
                playActivateSound(options);
                break;
            case 'notification':
                playNotificationSound(options);
                break;
        }
    } catch (error) {
        console.warn('Erreur audio:', error);
    }
}

// Son de clic organique
function playClickSound(options = {}) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Fréquence grave et organique
    oscillator.frequency.setValueAtTime(options.frequency || 120, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);
    
    // Envelope organique
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(options.volume || 0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    
    oscillator.type = 'triangle';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Son de survol subtil
function playHoverSound(options = {}) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(options.frequency || 200, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(240, audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(options.volume || 0.03, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// Son de tâche complétée
function playCompleteSound(options = {}) {
    // Accord ascendant pour la satisfaction
    const frequencies = [130.81, 164.81, 196.00]; // C3, E3, G3
    
    frequencies.forEach((freq, index) => {
        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
            
            oscillator.type = 'triangle';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        }, index * 100);
    });
}

// Son de battement de cœur
function playHeartbeatSound(options = {}) {
    // Premier battement
    setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
        
        oscillator.type = 'triangle';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
    }, 0);
    
    // Deuxième battement
    setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.12);
        
        oscillator.type = 'triangle';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.12);
    }, 200);
}

// Son de respiration
function playBreathingSound(options = {}) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Bruit blanc filtré pour simulation respiration
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(options.frequency || 40, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    filter.Q.setValueAtTime(1, audioContext.currentTime);
    
    // Enveloppe de respiration
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(options.volume || 0.05, audioContext.currentTime + 1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
}

// Sons d'activation/notification
function playActivateSound() {
    playSound('click', { frequency: 150, volume: 0.08 });
}

function playNotificationSound() {
    playSound('complete');
}

function playErrorSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.type = 'sawtooth';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Ambiance de fond
let ambientInterval = null;

function startAmbientSound() {
    if (ambientInterval) return;
    
    ambientInterval = setInterval(() => {
        if (audioEnabled && Math.random() < 0.3) {
            if (Math.random() < 0.7) {
                playBreathingSound({ volume: 0.02 });
            } else {
                playHeartbeatSound();
            }
        }
    }, 8000 + Math.random() * 4000); // Entre 8 et 12 secondes
}

function stopAmbientSound() {
    if (ambientInterval) {
        clearInterval(ambientInterval);
        ambientInterval = null;
    }
}

// Ajouter les event listeners pour les interactions
function addAudioInteractionListeners() {
    // Buttons et liens
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .nav-btn, .action-btn, .filter-btn, .domain-filter')) {
            playSound('click');
        }
    });
    
    // Hovers
    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('button, .nav-btn, .action-btn, .breathing')) {
            playSound('hover');
        }
    });
    
    // Tâches complétées
    document.addEventListener('change', (e) => {
        if (e.target.matches('.subtask-checkbox, .modal-subtask-checkbox')) {
            if (e.target.checked) {
                playSound('complete');
            } else {
                playSound('click');
            }
        }
    });
}

// Charger les préférences audio
function loadAudioPreferences() {
    const saved = localStorage.getItem('silexAudioEnabled');
    if (saved !== null) {
        audioEnabled = saved === 'true';
        const audioBtn = document.getElementById('audio-toggle');
        const audioIcon = audioBtn?.querySelector('.audio-icon');
        
        if (audioEnabled) {
            audioBtn?.classList.add('active');
            if (audioIcon) audioIcon.textContent = '🔊';
        } else {
            audioBtn?.classList.add('muted');
            if (audioIcon) audioIcon.textContent = '🔇';
        }
    }
}

// Charger les préférences au démarrage
setTimeout(() => {
    loadAudioPreferences();
}, 500);

// ===========================================
// FONCTIONNALITÉS MANAGEMENT
// ===========================================

// Initialiser la page Management
function initializeManagement() {
    if (window.location.pathname.includes('management.html')) {
        setupManagementEventListeners();
        updateManagementDashboard();
        updateManagementTable();
        updateTeamAnalysis();
    }
}

// Event listeners pour la page Management
function setupManagementEventListeners() {
    // Filtres de domaine
    const domainFilters = document.querySelectorAll('.domain-filter');
    domainFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Mettre à jour les filtres actifs
            domainFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            // Filtrer le tableau
            const domain = filter.dataset.domain;
            filterManagementTable(domain);
        });
    });

    // Assignation rapide
    const quickAssignBtn = document.getElementById('quick-assign-btn');
    if (quickAssignBtn) {
        quickAssignBtn.addEventListener('click', handleQuickAssign);
    }

    // Remplir le select des tâches
    populateTaskSelect();
}

// Mettre à jour le dashboard
function updateManagementDashboard() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const averageProgress = totalTasks > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks) : 0;

    // Mettre à jour les éléments du DOM
    const totalEl = document.getElementById('total-tasks');
    const completedEl = document.getElementById('completed-tasks');
    const inProgressEl = document.getElementById('in-progress-tasks');
    const avgProgressEl = document.getElementById('average-progress');

    if (totalEl) totalEl.textContent = totalTasks;
    if (completedEl) completedEl.textContent = completedTasks;
    if (inProgressEl) inProgressEl.textContent = inProgressTasks;
    if (avgProgressEl) avgProgressEl.textContent = averageProgress + '%';
}

// Mettre à jour le tableau de management
function updateManagementTable(filterDomain = 'all') {
    const tbody = document.getElementById('management-tasks-list');
    if (!tbody) return;

    const filteredTasks = filterDomain === 'all' ? tasks : tasks.filter(t => t.domain === filterDomain);
    
    tbody.innerHTML = '';

    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${getDomainText(task.domain)}</td>
            <td>${task.assignee}</td>
            <td>
                <div class="table-progress-bar">
                    <div class="table-progress-fill" style="width: ${task.progress}%"></div>
                </div>
                <span>${task.progress}%</span>
            </td>
            <td>${formatDate(task.deadline)}</td>
            <td class="table-priority">${task.priority}</td>
            <td>
                <span class="table-status-badge status-${task.status}">
                    ${getStatusText(task.status)}
                </span>
            </td>
            <td class="table-actions">
                <button class="table-action-btn" onclick="editTask(${task.id})">✏️</button>
                <button class="table-action-btn" onclick="showTaskDetails(${task.id})">👁️</button>
                <button class="table-action-btn" onclick="changeTaskStatus(${task.id})">⚡</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filtrer le tableau de management
function filterManagementTable(domain) {
    updateManagementTable(domain);
}

// Remplir le select des tâches pour l'assignation rapide
function populateTaskSelect() {
    const select = document.getElementById('quick-assign-task');
    if (!select) return;

    select.innerHTML = '<option value="">Sélectionner une tâche...</option>';
    
    tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = `${task.title} (${getDomainText(task.domain)})`;
        select.appendChild(option);
    });
}

// Gérer l'assignation rapide
function handleQuickAssign() {
    const taskSelect = document.getElementById('quick-assign-task');
    const userSelect = document.getElementById('quick-assign-user');
    
    const taskId = parseInt(taskSelect.value);
    const newAssignee = userSelect.value;
    
    if (!taskId || !newAssignee) {
        showNotification('Veuillez sélectionner une tâche et un assigné', 'error');
        return;
    }

    updateTask(taskId, { assignee: newAssignee });
    updateManagementTable();
    updateTeamAnalysis();
    
    // Reset des selects
    taskSelect.value = '';
    userSelect.value = '';
    
    showNotification(`Tâche assignée à ${newAssignee}`, 'success');
}

// Mettre à jour l'analyse par équipe
function updateTeamAnalysis() {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;

    // Grouper les tâches par assigné
    const teamStats = {};
    tasks.forEach(task => {
        const assignee = task.assignee;
        if (!teamStats[assignee]) {
            teamStats[assignee] = {
                name: assignee,
                totalTasks: 0,
                completedTasks: 0,
                averageProgress: 0,
                totalProgress: 0
            };
        }
        
        teamStats[assignee].totalTasks++;
        teamStats[assignee].totalProgress += task.progress;
        if (task.status === 'completed') {
            teamStats[assignee].completedTasks++;
        }
    });

    // Calculer les moyennes
    Object.values(teamStats).forEach(member => {
        member.averageProgress = member.totalTasks > 0 ? Math.round(member.totalProgress / member.totalTasks) : 0;
    });

    // Générer le HTML
    teamGrid.innerHTML = '';
    Object.values(teamStats).forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'team-member-card breathing';
        memberCard.innerHTML = `
            <div class="team-member-name">${member.name}</div>
            <div class="team-member-stats">
                <div class="team-stat">
                    <span class="team-stat-value">${member.totalTasks}</span>
                    <span class="team-stat-label">Tâches</span>
                </div>
                <div class="team-stat">
                    <span class="team-stat-value">${member.completedTasks}</span>
                    <span class="team-stat-label">Terminées</span>
                </div>
                <div class="team-stat">
                    <span class="team-stat-value">${member.averageProgress}%</span>
                    <span class="team-stat-label">Progression</span>
                </div>
            </div>
        `;
        teamGrid.appendChild(memberCard);
    });
}

// Changer rapidement le statut d'une tâche
function changeTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const statusOptions = ['not-started', 'in-progress', 'standby', 'completed'];
    const currentIndex = statusOptions.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const newStatus = statusOptions[nextIndex];

    updateTask(taskId, { status: newStatus });
    updateManagementDashboard();
    updateManagementTable();
    updateTeamAnalysis();
    
    showNotification(`Statut changé vers: ${getStatusText(newStatus)}`);
}

// Initialiser le management au chargement
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeManagement();
    }, 1500);
});

// ===========================================
// ANIMATIONS AVANCÉES ET MICRO-INTERACTIONS
// ===========================================

// Initialiser les animations avancées (optimisé)
function initializeAdvancedAnimations() {
    // Utiliser requestIdleCallback pour les animations non critiques
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            animateProgressBars();
            setupParallaxEffect();
            createFloatingParticles();
        });
        
        requestIdleCallback(() => {
            animateCounters();
            setupIntersectionObserver();
            setupFormAnimations();
        });
    } else {
        // Fallback pour les navigateurs plus anciens
        setTimeout(() => {
            animateProgressBars();
            animateCounters();
            setupParallaxEffect();
            setupIntersectionObserver();
            setupFormAnimations();
            createFloatingParticles();
        }, 1000);
    }
}

// Animer les barres de progression avec effet organique
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        bar.classList.add('organic');
        
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 500);
    });
}

// Animer les compteurs de statistiques
function animateCounters() {
    const counters = document.querySelectorAll('.stat-value');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 30);
    });
}

// Effet parallax subtil
function setupParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-particles');
        
        parallaxElements.forEach(element => {
            const speed = 0.1;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Observer pour les animations d'entrée
function setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-reveal');
                
                // Animation en cascade pour les éléments enfants
                const children = entry.target.querySelectorAll('.cascade-item');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.animationDelay = `${index * 0.1}s`;
                        child.classList.add('cascade-fade-in');
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observer les éléments
    const animatedElements = document.querySelectorAll('.breathing, .task-card, .stats-card');
    animatedElements.forEach(el => observer.observe(el));
}

// Micro-interactions pour les formulaires
function setupFormAnimations() {
    const formElements = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    
    formElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.classList.add('glow-pulse');
            playSound('hover', { frequency: 300, volume: 0.02 });
        });
        
        element.addEventListener('blur', () => {
            element.classList.remove('glow-pulse');
        });
        
        // Animation de typing pour les inputs
        if (element.tagName.toLowerCase() === 'input') {
            element.addEventListener('input', () => {
                element.classList.add('typing-animation');
                clearTimeout(element.typingTimer);
                element.typingTimer = setTimeout(() => {
                    element.classList.remove('typing-animation');
                }, 1000);
            });
        }
    });
}

// Créer des particules flottantes dynamiques
function createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Créer des particules périodiquement
    setInterval(() => {
        if (document.querySelectorAll('.floating-particle').length < 10) {
            createParticle(particleContainer);
        }
    }, 3000);
}

// Créer une particule individuelle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    
    const size = Math.random() * 4 + 2;
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight + 50;
    const opacity = Math.random() * 0.5 + 0.2;
    const duration = Math.random() * 10 + 15;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, var(--rouge-sang) 0%, transparent 70%);
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        opacity: ${opacity};
        animation: float-upward ${duration}s linear forwards;
        pointer-events: none;
    `;
    
    // Animation CSS dynamique
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-upward {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: ${opacity};
            }
            100% {
                transform: translateY(-${window.innerHeight + 100}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    container.appendChild(particle);
    
    // Nettoyer après l'animation
    setTimeout(() => {
        if (container.contains(particle)) {
            container.removeChild(particle);
        }
        if (document.head.contains(style)) {
            document.head.removeChild(style);
        }
    }, duration * 1000);
}

// Animation spéciale pour la complétion de tâche
function animateTaskCompletion(taskElement) {
    // Effet de flash
    taskElement.style.animation = 'glow-pulse 0.5s ease-in-out 3';
    
    // Particules d'explosion
    createCompletionParticles(taskElement);
    
    // Son de victoire
    playSound('complete');
    
    setTimeout(() => {
        taskElement.style.animation = '';
    }, 1500);
}

// Créer des particules pour la complétion
function createCompletionParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 100 + Math.random() * 50;
        const size = Math.random() * 6 + 4;
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: var(--rouge-sang);
            border-radius: 50%;
            left: ${centerX}px;
            top: ${centerY}px;
            pointer-events: none;
            z-index: 1000;
            transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        
        document.body.appendChild(particle);
        
        // Animer la particule
        requestAnimationFrame(() => {
            const deltaX = Math.cos(angle) * velocity;
            const deltaY = Math.sin(angle) * velocity;
            
            particle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            particle.style.opacity = '0';
            particle.style.transform += ' scale(0)';
        });
        
        // Nettoyer
        setTimeout(() => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        }, 1000);
    }
}

// Animation de mise à jour des statistiques
function animateStatUpdate(statElement, newValue) {
    statElement.style.transform = 'scale(1.2)';
    statElement.style.color = 'var(--rouge-sang-clair)';
    
    setTimeout(() => {
        statElement.textContent = newValue;
        statElement.style.transform = 'scale(1)';
        statElement.style.color = '';
    }, 200);
}

// Effet de hover avancé pour les cartes
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.task-card')) {
        const card = e.target.closest('.task-card');
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(163, 22, 33, 0.3)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.task-card')) {
        const card = e.target.closest('.task-card');
        card.style.transform = '';
        card.style.boxShadow = '';
    }
});

// ===============================================
// OPTIMISATIONS DE PERFORMANCE
// ===============================================

function initializePerformanceOptimizations() {
    // Enregistrer le service worker
    registerServiceWorker();
    
    // Lazy loading pour les images
    setupLazyLoading();
    
    // Optimisation des animations
    setupAnimationOptimizations();
    
    // Préchargement intelligent des ressources
    preloadCriticalResources();
    
    // Optimisation de la mémoire
    setupMemoryOptimizations();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker enregistré avec succès:', registration.scope);
                    
                    // Vérifier les mises à jour
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Notifier l'utilisateur qu'une mise à jour est disponible
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.warn('Échec de l\'enregistrement du Service Worker:', error);
                });
        });
    }
}

function showUpdateNotification() {
    // Créer une notification discrète pour les mises à jour
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <span>🔄 Mise à jour disponible</span>
            <button onclick="updateApp()" class="update-btn">Actualiser</button>
            <button onclick="dismissUpdate()" class="dismiss-btn">✕</button>
        </div>
    `;
    
    // Styles pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-dark);
        color: var(--text-light);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Supprimer automatiquement après 10 secondes
    setTimeout(() => {
        dismissUpdate();
    }, 10000);
}

// Fonctions pour les mises à jour
window.updateApp = function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        });
    }
};

window.dismissUpdate = function() {
    const notification = document.querySelector('.update-notification');
    if (notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
};

function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback pour les navigateurs plus anciens
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        });
    }
}

function setupAnimationOptimizations() {
    // Réduire les animations si l'utilisateur préfère un mouvement réduit
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01s');
        return;
    }
    
    // Optimiser les animations basées sur les performances de l'appareil
    const deviceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    if (deviceMemory < 4 || hardwareConcurrency < 4) {
        // Réduire la complexité des animations sur les appareils moins puissants
        document.documentElement.classList.add('reduced-animations');
        
        // Réduire le nombre de particules
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index % 2 === 0) {
                particle.remove();
            }
        });
    }
}

function preloadCriticalResources() {
    // Précharger les ressources critiques de manière intelligente
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            const criticalResources = ['css/style.css', 'js/main.js'];
            
            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = resource;
                document.head.appendChild(link);
            });
        });
    }
}

function setupMemoryOptimizations() {
    // Nettoyer les event listeners non utilisés
    const cleanupObservers = () => {
        // Nettoyer les observers après utilisation
        if (window.particleObserver) {
            window.particleObserver.disconnect();
        }
    };
    
    // Nettoyer lors du déchargement de la page
    window.addEventListener('beforeunload', cleanupObservers);
    
    // Limiter le nombre de particules actives
    setInterval(() => {
        const particles = document.querySelectorAll('.particle');
        if (particles.length > 100) {
            // Supprimer les particules les plus anciennes
            for (let i = 0; i < 20; i++) {
                if (particles[i]) {
                    particles[i].remove();
                }
            }
        }
    }, 10000);
}