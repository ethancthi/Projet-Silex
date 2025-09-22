// ===========================================
// APPLICATION PRINCIPALE ET INITIALISATION
// ===========================================

import { CONFIG } from './config.js';
import { initEventListeners } from '../modules/events.js';
import { loadTasksFromStorage } from '../utils/storage.js';
import { updateTasksList } from '../modules/tasks.js';
import { initAudio, setupAudioEvents } from '../modules/audio.js';

// ===========================================
// INITIALISATION PRINCIPALE
// ===========================================
export function initializeApp() {
    console.log('🚀 Initialisation de Projet Silex...');
    
    // Configuration de base
    console.log('📋 Configuration:', CONFIG);
    
    // Initialisation des événements
    initEventListeners();
    
    // Chargement des données
    loadTasksFromStorage();
    
    // Mise à jour de l'interface
    updateTasksList();
}

// ===========================================
// DÉMARRAGE DE L'APPLICATION
// ===========================================
export function startApp() {
    // Initialisation principale
    initializeApp();
    
    // Initialisation du système audio
    if (typeof initAudio === 'function') {
        initAudio();
        setupAudioEvents();
    }
}

// Démarrer l'application une fois le DOM chargé
document.addEventListener('DOMContentLoaded', startApp);