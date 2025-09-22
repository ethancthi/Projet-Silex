// ===========================================
// GESTION DES ÉVÉNEMENTS
// ===========================================

import { handleTaskSubmit, updateTasksList, deleteTask, initQuickAssignment } from '../modules/tasks.js';
import { playClickSound } from '../modules/audio.js';
import { showNotification, showConfirmNotification } from '../components/notifications.js';
import { getCurrentFilter, setCurrentFilter } from '../core/config.js';

// ===========================================
// INITIALISATION DES ÉVÉNEMENTS
// ===========================================
export function initEventListeners() {
    initTaskEvents();
    initFilterEvents();
    initModalEvents();
    initRangeInputEvents();
    initSubtaskEvents();
    initExportImportEvents();
    initQuickAssignment();
}

// ===========================================
// ÉVÉNEMENTS DES TÂCHES
// ===========================================
function initTaskEvents() {
    console.log('🐛 DEBUG: initTaskEvents called');
    
    // Soumission du formulaire de tâche
    const taskForm = document.getElementById('task-form');
    console.log('🐛 DEBUG: Task form element:', taskForm);
    
    if (taskForm) {
        console.log('🐛 DEBUG: Adding submit event listener to form');
        taskForm.addEventListener('submit', handleTaskSubmit);
        console.log('🐛 DEBUG: Submit event listener added successfully');
    } else {
        console.error('❌ ERROR: Task form not found!');
    }
    
    // Boutons d'action des tâches (délégation d'événements)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.edit-btn') || e.target.closest('.edit-btn')) {
            e.preventDefault();
            const taskId = getTaskIdFromElement(e.target);
            if (taskId) editTask(taskId);
        }
        
        if (e.target.matches('.delete-btn') || e.target.closest('.delete-btn')) {
            e.preventDefault();
            const taskId = getTaskIdFromElement(e.target);
            if (taskId) confirmDeleteTask(taskId);
        }
        
        if (e.target.matches('.details-btn') || e.target.closest('.details-btn')) {
            e.preventDefault();
            const taskId = getTaskIdFromElement(e.target);
            if (taskId) showTaskDetails(taskId);
        }
    });
}

// ===========================================
// ÉVÉNEMENTS DES FILTRES
// ===========================================
function initFilterEvents() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = btn.getAttribute('data-filter');
            setCurrentFilter(filter);
            
            // Mise à jour de l'UI des filtres
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mise à jour de la liste des tâches
            updateTasksList();
            
            // Feedback audio
            playClickSound();
        });
    });
}

// ===========================================
// ÉVÉNEMENTS DES MODALES
// ===========================================
function initModalEvents() {
    // Fermeture des modales
    document.addEventListener('click', (e) => {
        if (e.target.matches('.modal') || e.target.matches('.modal-close')) {
            closeAllModals();
        }
    });
    
    // Échapper pour fermer les modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ===========================================
// ÉVÉNEMENTS DES RANGES
// ===========================================
function initRangeInputEvents() {
    const difficultyRange = document.getElementById('task-difficulty');
    const priorityRange = document.getElementById('task-priority');
    
    if (difficultyRange) {
        difficultyRange.addEventListener('input', updateRangeValues);
    }
    
    if (priorityRange) {
        priorityRange.addEventListener('input', updateRangeValues);
    }
}

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
// ÉVÉNEMENTS DES SOUS-TÂCHES
// ===========================================
function initSubtaskEvents() {
    // Ajouter une sous-tâche
    const addSubtaskBtn = document.getElementById('add-subtask');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', addSubtask);
    }
    
    // Délégation d'événements pour les sous-tâches
    document.addEventListener('click', (e) => {
        if (e.target.matches('.remove-subtask')) {
            e.target.closest('.subtask-item').remove();
        }
        
        if (e.target.matches('.subtask-checkbox')) {
            const subtaskItem = e.target.closest('.subtask-item');
            if (subtaskItem) {
                subtaskItem.classList.toggle('completed', e.target.checked);
            }
        }
    });
}

function addSubtask() {
    const subtaskInput = document.getElementById('subtask-input');
    const subtasksList = document.getElementById('subtasks-list');
    
    if (!subtaskInput || !subtasksList) return;
    
    const subtaskText = subtaskInput.value.trim();
    if (!subtaskText) return;
    
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'subtask-item';
    subtaskItem.dataset.level = '0';
    
    subtaskItem.innerHTML = `
        <input type="checkbox" class="subtask-checkbox">
        <span class="subtask-text" contenteditable="true">${subtaskText}</span>
        <button type="button" class="remove-subtask">🗑️</button>
    `;
    
    subtasksList.appendChild(subtaskItem);
    subtaskInput.value = '';
    subtaskInput.focus();
}

// ===========================================
// ÉVÉNEMENTS D'EXPORT/IMPORT
// ===========================================
function initExportImportEvents() {
    // Export
    const exportBtn = document.getElementById('export-tasks');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            import('../utils/storage.js').then(storage => {
                const success = storage.exportTasksToJSON();
                if (success) {
                    showNotification('Tâches exportées avec succès !', 'success');
                } else {
                    showNotification('Erreur lors de l\'export', 'error');
                }
            });
        });
    }
    
    // Import
    const importBtn = document.getElementById('import-tasks');
    const importFile = document.getElementById('import-file');
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
        
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                import('../utils/storage.js').then(storage => {
                    storage.importTasksFromJSON(file)
                        .then(() => {
                            showNotification('Tâches importées avec succès !', 'success');
                            updateTasksList();
                        })
                        .catch(error => {
                            showNotification(`Erreur lors de l'import: ${error.message}`, 'error');
                        });
                });
            }
        });
    }
}

// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================
function getTaskIdFromElement(element) {
    const taskCard = element.closest('.task-card');
    return taskCard ? parseInt(taskCard.getAttribute('data-task-id')) : null;
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// ===========================================
// FONCTIONS GLOBALES (pour les onclick)
// ===========================================
window.editTask = function(taskId) {
    console.log('Édition de la tâche:', taskId);
    showNotification('Fonction d\'édition en développement', 'info');
};

window.confirmDeleteTask = function(taskId) {
    showConfirmNotification(
        'Êtes-vous sûr de vouloir supprimer cette tâche ?',
        () => {
            deleteTask(taskId);
            showNotification('Tâche supprimée', 'success');
        },
        () => {
            showNotification('Suppression annulée', 'info');
        }
    );
};

window.showTaskDetails = function(taskId) {
    console.log('Détails de la tâche:', taskId);
    showNotification('Fonction de détails en développement', 'info');
};