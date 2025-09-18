// ===========================================
// PROJET SILEX - GESTIONNAIRE DE TÂCHES
// ===========================================

// Variables globales
let tasks = [];
let currentFilter = 'all';
let taskIdCounter = 1;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
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
    showNotification('Tâche créée avec succès !');
}

function createTaskFromForm(formData) {
    const deadline = new Date(document.getElementById('task-deadline').value);
    
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
        progress: calculateInitialProgress(document.getElementById('task-status').value),
        steps: []
    };
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
            <div class="detail-row">
                <strong>Créée le:</strong> ${formatDate(task.createdAt)}
            </div>
            
            <div class="progress-section">
                <h4>Progression: ${task.progress}%</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${task.progress}%"></div>
                </div>
                
                <div class="progress-controls">
                    <button onclick="updateTaskProgress(${task.id}, ${Math.max(0, task.progress - 25)})">-25%</button>
                    <button onclick="updateTaskProgress(${task.id}, ${Math.min(100, task.progress + 25)})">+25%</button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function updateTaskProgress(taskId, newProgress) {
    updateTask(taskId, { progress: newProgress });
    showTaskDetails(taskId); // Refresh modal
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
        // Convertir les dates stockées en objets Date
        tasks.forEach(task => {
            task.deadline = new Date(task.deadline);
            task.createdAt = new Date(task.createdAt);
        });
    }
    
    if (storedCounter) {
        taskIdCounter = parseInt(storedCounter);
    }
}

// ===========================================
// NOTIFICATIONS
// ===========================================
function showNotification(message) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, var(--rouge-sang) 0%, var(--rouge-sang-clair) 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
        transform: translateX(100%);
        transition: transform 0.3s ease;
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
            document.body.removeChild(notification);
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
                steps: []
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
                steps: []
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
                steps: []
            }
        ];
        
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