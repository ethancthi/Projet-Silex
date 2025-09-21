// ===========================================
// APPLICATION PRINCIPALE ET INITIALISATION
// ===========================================

import { CONFIG } from './config.js';
import { setupEventListeners } from '../modules/events.js';
import { setupCursorTrail } from '../components/cursor.js';
import { loadTasksFromStorage } from '../utils/storage.js';
import { updateTasksList } from '../modules/tasks.js';
import { updateRangeValues } from '../components/forms.js';
import { initializeAudio, loadAudioPreferences } from '../modules/audio.js';
import { initializeAdvancedAnimations } from '../animations/advanced.js';
import { initializePerformanceOptimizations } from '../utils/performance.js';
import { createDemoTasks } from '../utils/demo.js';
import { initializeManagement } from '../modules/management.js';

// ===========================================
// INITIALISATION PRINCIPALE
// ===========================================
export function initializeApp() {
    setupEventListeners();
    setupCursorTrail();
    loadTasksFromStorage();
    updateTasksList();
    updateRangeValues();
}

// ===========================================
// DÉMARRAGE DE L'APPLICATION
// ===========================================
export function startApp() {
    // Initialisation principale
    initializeApp();
    
    // Initialisation du système audio
    initializeAudio();
    
    // Animations avancées (en arrière-plan)
    initializeAdvancedAnimations();
    
    // Optimisations de performance
    initializePerformanceOptimizations();
    
    // Charger les préférences audio
    setTimeout(() => {
        loadAudioPreferences();
    }, 500);
    
    // Créer des tâches de démonstration si nécessaire
    setTimeout(() => {
        createDemoTasks();
    }, 1000);
    
    // Initialiser le management
    setTimeout(() => {
        initializeManagement();
    }, 1500);
}

// Démarrer l'application une fois le DOM chargé
document.addEventListener('DOMContentLoaded', startApp);