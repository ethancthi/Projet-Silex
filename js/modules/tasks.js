// ===========================================
// GESTION DES TÂCHES ET MANAGEMENT
// ===========================================

import { tasks, setTasks, incrementTaskIdCounter, getCurrentFilter } from '../core/config.js';
import { saveTasksToStorage } from '../utils/storage.js';
import { showNotification } from '../components/notifications.js';
import { formatDate, calculateDaysRemaining, getStatusText, getDomainText } from '../utils/helpers.js';

// ===========================================
// CRÉATION ET GESTION DES TÂCHES
// ===========================================
export function handleTaskSubmit(e) {
    console.log('🐛 DEBUG: handleTaskSubmit called');
    e.preventDefault();
    
    try {
        console.log('🐛 DEBUG: Form data collection starting...');
        const formData = new FormData(e.target);
        console.log('🐛 DEBUG: FormData created:', formData);
        
        console.log('🐛 DEBUG: Creating task from form...');
        const task = createTaskFromForm(formData);
        console.log('🐛 DEBUG: Task created:', task);
        
        console.log('🐛 DEBUG: Adding task...');
        addTask(task);
        console.log('🐛 DEBUG: Task added successfully');
        
        console.log('🐛 DEBUG: Resetting form...');
        e.target.reset();
        
        console.log('🐛 DEBUG: Updating UI...');
        updateRangeValues();
        updateTasksList();
        
        // Afficher un feedback visuel
        console.log('🐛 DEBUG: Showing notification...');
        showNotification('Tâche créée avec succès !', 'success');
        console.log('🐛 DEBUG: Task creation completed successfully');
    } catch (error) {
        console.error('❌ ERROR in handleTaskSubmit:', error);
        console.error('❌ ERROR stack:', error.stack);
        showNotification('Erreur lors de la création de la tâche: ' + error.message, 'error');
    }
}

export function createTaskFromForm(formData) {
    console.log('🐛 DEBUG: createTaskFromForm started');
    
    try {
        console.log('🐛 DEBUG: Getting deadline value...');
        const deadlineInput = document.getElementById('task-deadline');
        if (!deadlineInput) throw new Error('task-deadline input not found');
        const deadline = new Date(deadlineInput.value);
        console.log('🐛 DEBUG: Deadline:', deadline);
        
        // Récupérer les sous-tâches
        console.log('🐛 DEBUG: Getting subtasks...');
        const subtasks = [];
        const subtaskElements = document.querySelectorAll('.subtask-item');
        console.log('🐛 DEBUG: Found subtask elements:', subtaskElements.length);
        
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
        
        console.log('🐛 DEBUG: Collecting form values...');
        const titleElement = document.getElementById('task-title');
        if (!titleElement) throw new Error('task-title input not found');
        
        const task = {
            id: incrementTaskIdCounter(),
            title: titleElement.value,
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
        
        console.log('🐛 DEBUG: Task object created successfully:', task);
        return task;
        
    } catch (error) {
        console.error('❌ ERROR in createTaskFromForm:', error);
        throw error;
    }
}

export function calculateProgressFromSubtasks(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return 0;
    }
    
    const completedCount = subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
}

export function addTask(task) {
    console.log('🐛 DEBUG: addTask called with:', task);
    console.log('🐛 DEBUG: Current tasks array length:', tasks.length);
    
    tasks.push(task);
    console.log('🐛 DEBUG: Task added. New tasks array length:', tasks.length);
    console.log('🐛 DEBUG: Updated tasks array:', tasks);
    
    console.log('🐛 DEBUG: Saving to storage...');
    saveTasksToStorage();
    console.log('🐛 DEBUG: Saved to storage successfully');
}

export function deleteTask(taskId) {
    const newTasks = tasks.filter(task => task.id !== taskId);
    setTasks(newTasks);
    saveTasksToStorage();
    updateTasksList();
    showNotification('Tâche supprimée');
}

export function updateTask(taskId, updates) {
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
export function updateTasksList() {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    const filteredTasks = filterTasks(tasks, getCurrentFilter());
    const sortedTasks = sortTasksByPriority(filteredTasks);
    
    tasksList.innerHTML = '';
    
    if (sortedTasks.length === 0) {
        tasksList.innerHTML = '<div class="no-tasks">Aucune tâche trouvée</div>';
    } else {
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksList.appendChild(taskElement);
        });
    }
    
    // Mettre à jour également le tableau de bord
    updateDashboardStats();
    updatePriorityTasksList();
    updateQuickAssignTasksList();
}

export function filterTasks(tasks, filter) {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.status === filter);
}

export function sortTasksByPriority(tasks) {
    return [...tasks].sort((a, b) => {
        // Trier par priorité (plus haut = plus prioritaire)
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        // En cas d'égalité, trier par deadline
        return new Date(a.deadline) - new Date(b.deadline);
    });
}

export function createTaskElement(task) {
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
            <button class="action-btn edit-btn" onclick="window.editTask(${task.id})">✏️ Modifier</button>
            <button class="action-btn delete-btn" onclick="window.confirmDeleteTask(${task.id})">🗑️ Supprimer</button>
            <button class="action-btn details-btn" onclick="window.showTaskDetails(${task.id})">👁️ Détails</button>
        </div>
    `;
    
    return taskDiv;
}

// Fonctions pour l'import des range values
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
// GESTION DU TABLEAU DE BORD ET MANAGEMENT
// ===========================================

// ===========================================
// STATISTIQUES GÉNÉRALES
// ===========================================
export function updateDashboardStats() {
    const stats = calculateTaskStats();
    
    updateStatElement('total-tasks', stats.total);
    updateStatElement('completed-tasks', stats.completed);
    updateStatElement('pending-tasks', stats.pending);
    updateStatElement('overdue-tasks', stats.overdue);
    updateStatElement('completion-rate', `${stats.completionRate}%`);
    updateStatElement('avg-priority', stats.avgPriority.toFixed(1));
}

function calculateTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'done' || task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'not-started' || task.status === 'in-progress').length;
    
    const today = new Date();
    const overdue = tasks.filter(task => {
        return new Date(task.deadline) < today && task.status !== 'done' && task.status !== 'completed';
    }).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const avgPriority = total > 0 
        ? tasks.reduce((sum, task) => sum + (task.priority || 0), 0) / total 
        : 0;
    
    return {
        total,
        completed,
        pending,
        overdue,
        completionRate,
        avgPriority
    };
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// ===========================================
// TÂCHES PRIORITAIRES
// ===========================================
export function updatePriorityTasksList() {
    const priorityTasks = getPriorityTasks();
    const container = document.getElementById('priority-tasks');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (priorityTasks.length === 0) {
        container.innerHTML = '<div class="no-priority-tasks">Aucune tâche prioritaire</div>';
        return;
    }
    
    priorityTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'priority-task-item';
        taskElement.innerHTML = `
            <div class="priority-task-title">${task.title}</div>
            <div class="priority-task-info">
                <span class="priority-task-priority">Priorité: ${task.priority}</span>
                <span class="priority-task-deadline">${formatDate(task.deadline)}</span>
            </div>
        `;
        container.appendChild(taskElement);
    });
}

function getPriorityTasks() {
    return tasks
        .filter(task => task.status !== 'done' && task.status !== 'completed' && task.status !== 'cancelled')
        .filter(task => task.priority >= 70)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5);
}

// ===========================================
// ASSIGNATION RAPIDE
// ===========================================
export function initQuickAssignment() {
    const quickAssignBtn = document.getElementById('quick-assign-btn');
    const taskSelect = document.getElementById('quick-assign-task');
    const userSelect = document.getElementById('quick-assign-user');
    
    if (quickAssignBtn) {
        quickAssignBtn.addEventListener('click', () => {
            const taskId = parseInt(taskSelect.value);
            const assignee = userSelect.value;
            
            if (taskId && assignee) {
                updateTask(taskId, { assignee: assignee });
                showNotification(`Tâche assignée à ${assignee}`, 'success');
                updateQuickAssignTasksList();
                taskSelect.value = '';
                userSelect.value = '';
            } else {
                showNotification('Veuillez sélectionner une tâche et un assigné', 'warning');
            }
        });
    }
    
    updateQuickAssignTasksList();
}

export function updateQuickAssignTasksList() {
    const taskSelect = document.getElementById('quick-assign-task');
    if (!taskSelect) return;
    
    // Garder la première option
    taskSelect.innerHTML = '<option value="">Sélectionner une tâche...</option>';
    
    // Ajouter les tâches non terminées
    const uncompletedTasks = tasks.filter(task => 
        task.status !== 'done' && task.status !== 'completed'
    );
    
    uncompletedTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = `${task.title} (${getStatusText(task.status)})`;
        taskSelect.appendChild(option);
    });
}

// ===========================================
// GRAPHIQUES ET VISUALISATIONS
// ===========================================
export function updateTasksByStatusChart() {
    const statusCounts = getTasksByStatus();
    const chartContainer = document.getElementById('status-chart');
    
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '';
    
    Object.entries(statusCounts).forEach(([status, count]) => {
        if (count > 0) {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.innerHTML = `
                <div class="chart-bar-fill status-${status}" style="height: ${(count / tasks.length) * 100}%"></div>
                <div class="chart-bar-label">
                    <div class="chart-status">${getStatusText(status)}</div>
                    <div class="chart-count">${count}</div>
                </div>
            `;
            chartContainer.appendChild(bar);
        }
    });
}

export function updateTasksByDomainChart() {
    const domainCounts = getTasksByDomain();
    const chartContainer = document.getElementById('domain-chart');
    
    if (!chartContainer) return;
    
    chartContainer.innerHTML = '';
    
    Object.entries(domainCounts).forEach(([domain, count]) => {
        if (count > 0) {
            const percentage = Math.round((count / tasks.length) * 100);
            const segment = document.createElement('div');
            segment.className = 'chart-segment';
            segment.innerHTML = `
                <div class="chart-segment-info">
                    <span class="chart-domain">${getDomainText(domain)}</span>
                    <span class="chart-percentage">${percentage}%</span>
                    <span class="chart-count">(${count})</span>
                </div>
            `;
            chartContainer.appendChild(segment);
        }
    });
}

function getTasksByStatus() {
    const statusCounts = {
        'not-started': 0,
        'in-progress': 0,
        'standby': 0,
        'completed': 0,
        'cancelled': 0
    };
    
    tasks.forEach(task => {
        if (statusCounts.hasOwnProperty(task.status)) {
            statusCounts[task.status]++;
        }
    });
    
    return statusCounts;
}

function getTasksByDomain() {
    const domainCounts = {};
    
    tasks.forEach(task => {
        const domain = task.domain || 'other';
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
    
    return domainCounts;
}

// ===========================================
// TÂCHES EN RETARD
// ===========================================
export function updateOverdueTasksList() {
    const overdueTasks = getOverdueTasks();
    const container = document.getElementById('overdue-tasks');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (overdueTasks.length === 0) {
        container.innerHTML = '<div class="no-overdue-tasks">Aucune tâche en retard</div>';
        return;
    }
    
    overdueTasks.forEach(task => {
        const daysOverdue = Math.abs(Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)));
        const taskElement = document.createElement('div');
        taskElement.className = 'overdue-task-item';
        taskElement.innerHTML = `
            <div class="overdue-task-title">${task.title}</div>
            <div class="overdue-task-info">
                <span class="overdue-task-days">${daysOverdue} jour(s) en retard</span>
                <span class="overdue-task-status">${getStatusText(task.status)}</span>
            </div>
        `;
        container.appendChild(taskElement);
    });
}

function getOverdueTasks() {
    const today = new Date();
    return tasks
        .filter(task => task.status !== 'done' && task.status !== 'completed' && task.status !== 'cancelled')
        .filter(task => new Date(task.deadline) < today)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);
}

// ===========================================
// ACTIVITÉ RÉCENTE
// ===========================================
export function updateRecentActivity() {
    const recentTasks = getRecentTasks();
    const container = document.getElementById('recent-activity');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (recentTasks.length === 0) {
        container.innerHTML = '<div class="no-recent-activity">Aucune activité récente</div>';
        return;
    }
    
    recentTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'recent-activity-item';
        taskElement.innerHTML = `
            <div class="recent-activity-title">${task.title}</div>
            <div class="recent-activity-info">
                <span class="recent-activity-status">${getStatusText(task.status)}</span>
                <span class="recent-activity-date">Créé le ${formatDate(task.createdAt)}</span>
            </div>
        `;
        container.appendChild(taskElement);
    });
}

function getRecentTasks() {
    return tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
}

// ===========================================
// PROGRESSION MENSUELLE
// ===========================================
export function updateMonthlyProgress() {
    const monthlyStats = getMonthlyStats();
    const container = document.getElementById('monthly-progress');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="monthly-stat">
            <span class="monthly-stat-label">Tâches créées ce mois:</span>
            <span class="monthly-stat-value">${monthlyStats.created}</span>
        </div>
        <div class="monthly-stat">
            <span class="monthly-stat-label">Tâches terminées ce mois:</span>
            <span class="monthly-stat-value">${monthlyStats.completed}</span>
        </div>
        <div class="monthly-stat">
            <span class="monthly-stat-label">Taux de réalisation:</span>
            <span class="monthly-stat-value">${monthlyStats.completionRate}%</span>
        </div>
    `;
}

function getMonthlyStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const createdThisMonth = tasks.filter(task => 
        new Date(task.createdAt) >= startOfMonth
    ).length;
    
    const completedThisMonth = tasks.filter(task => 
        (task.status === 'done' || task.status === 'completed') && new Date(task.createdAt) >= startOfMonth
    ).length;
    
    const completionRate = createdThisMonth > 0 
        ? Math.round((completedThisMonth / createdThisMonth) * 100) 
        : 0;
    
    return {
        created: createdThisMonth,
        completed: completedThisMonth,
        completionRate
    };
}

// ===========================================
// MISE À JOUR COMPLÈTE DU TABLEAU DE BORD
// ===========================================
export function updateFullDashboard() {
    updateDashboardStats();
    updateTasksByStatusChart();
    updateTasksByDomainChart();
    updatePriorityTasksList();
    updateOverdueTasksList();
    updateRecentActivity();
    updateMonthlyProgress();
    updateQuickAssignTasksList();
}