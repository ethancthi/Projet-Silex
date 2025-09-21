// ===========================================
// UTILITAIRES DE STOCKAGE
// ===========================================

import { tasks, setTasks } from '../core/config.js';

const STORAGE_KEY = 'silex_tasks';
const SETTINGS_KEY = 'silex_settings';

// ===========================================
// GESTION DES TÂCHES
// ===========================================
export function saveTasksToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des tâches:', error);
    }
}

export function loadTasksFromStorage() {
    try {
        const storedTasks = localStorage.getItem(STORAGE_KEY);
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            // Convertir les dates string en objets Date
            const tasksWithDates = parsedTasks.map(task => ({
                ...task,
                deadline: new Date(task.deadline),
                createdAt: new Date(task.createdAt),
                subtasks: task.subtasks ? task.subtasks.map(subtask => ({
                    ...subtask,
                    createdAt: new Date(subtask.createdAt)
                })) : []
            }));
            setTasks(tasksWithDates);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        setTasks([]);
    }
}

export function clearTasksStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        setTasks([]);
    } catch (error) {
        console.error('Erreur lors de la suppression des tâches:', error);
    }
}

// ===========================================
// GESTION DES PARAMÈTRES
// ===========================================
export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
}

export function loadSettings() {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        return storedSettings ? JSON.parse(storedSettings) : {};
    } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        return {};
    }
}

// ===========================================
// EXPORT/IMPORT DE DONNÉES
// ===========================================
export function exportTasksToJSON() {
    try {
        const dataToExport = {
            tasks: tasks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `silex_tasks_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        return false;
    }
}

export function importTasksFromJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.tasks && Array.isArray(importedData.tasks)) {
                    // Convertir les dates et valider les données
                    const validTasks = importedData.tasks.map(task => ({
                        ...task,
                        deadline: new Date(task.deadline),
                        createdAt: new Date(task.createdAt),
                        subtasks: task.subtasks ? task.subtasks.map(subtask => ({
                            ...subtask,
                            createdAt: new Date(subtask.createdAt)
                        })) : []
                    }));
                    
                    setTasks(validTasks);
                    saveTasksToStorage();
                    resolve(validTasks);
                } else {
                    reject(new Error('Format de fichier invalide'));
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Erreur lors de la lecture du fichier'));
        };
        
        reader.readAsText(file);
    });
}

// ===========================================
// UTILITAIRES DE STOCKAGE
// ===========================================
export function getStorageSize() {
    try {
        const tasksSize = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size;
        const settingsSize = new Blob([localStorage.getItem(SETTINGS_KEY) || '']).size;
        
        return {
            tasks: tasksSize,
            settings: settingsSize,
            total: tasksSize + settingsSize
        };
    } catch (error) {
        console.error('Erreur lors du calcul de la taille:', error);
        return { tasks: 0, settings: 0, total: 0 };
    }
}

export function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

// ===========================================
// SAUVEGARDE AUTOMATIQUE
// ===========================================
let autoSaveInterval = null;

export function startAutoSave(intervalMinutes = 5) {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    autoSaveInterval = setInterval(() => {
        saveTasksToStorage();
        console.log('Sauvegarde automatique effectuée');
    }, intervalMinutes * 60 * 1000);
}

export function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}