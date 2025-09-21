// ===========================================
// MAIN.JS - POINT D'ENTRÉE PRINCIPAL
// ===========================================

// Imports des modules principaux
import { initializeApp } from './core/app.js';
import { loadTasksFromStorage, startAutoSave } from './utils/storage.js';
import { initAudio, setupAudioEvents } from './modules/audio.js';
import { initEventListeners } from './modules/events.js';
import { updateTasksList, updateFullDashboard } from './modules/tasks.js';
import { initAllAnimations } from './animations/effects.js';

// ===========================================
// INITIALISATION DE L'APPLICATION
// ===========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log(' Initialisation de l\'application Silex...');
        
        // 1. Initialiser la configuration de base
        initializeApp();
        
        // 2. Charger les données sauvegardées
        loadTasksFromStorage();
        
        // 3. Initialiser les systèmes audio
        if (typeof Audio !== 'undefined') {
            initAudio();
            setupAudioEvents();
        }
        
        // 4. Configurer les événements
        initEventListeners();
        
        // 5. Initialiser les animations et effets visuels
        initAllAnimations();
        
        // 6. Mettre à jour l'interface utilisateur
        updateTasksList();
        
        // 7. Mettre à jour le tableau de bord si on est sur la page tasks
        if (window.location.pathname.includes('tasks.html')) {
            updateFullDashboard();
        }
        
        // 8. Démarrer la sauvegarde automatique
        startAutoSave(5); // Sauvegarde toutes les 5 minutes
        
        // 9. Afficher un message de bienvenue
        setTimeout(() => {
            if (typeof window.showNotification === 'function') {
                showNotification('Application Silex chargée avec succès ! ', 'success');
            }
        }, 1000);
        
        console.log(' Application Silex initialisée avec succès !');
        
    } catch (error) {
        console.error(' Erreur lors de l\'initialisation:', error);
        
        // Afficher une notification d'erreur si possible
        if (typeof window.showNotification === 'function') {
            showNotification('Erreur lors du chargement de l\'application', 'error');
        }
    }
});

// ===========================================
// GESTION DES ERREURS GLOBALES
// ===========================================
window.addEventListener('error', (event) => {
    console.error(' Erreur JavaScript:', event.error);
    
    // Afficher une notification d'erreur
    if (typeof window.showNotification === 'function') {
        showNotification('Une erreur inattendue s\'est produite', 'error');
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error(' Promesse rejetée:', event.reason);
    
    // Afficher une notification d'erreur
    if (typeof window.showNotification === 'function') {
        showNotification('Erreur de chargement des données', 'error');
    }
});

// ===========================================
// FONCTIONS GLOBALES (compatibilité)
// ===========================================

// Ces fonctions sont nécessaires pour la compatibilité avec les onclick dans le HTML
window.showNotification = function(message, type = 'info', duration = 3000) {
    import('./components/notifications.js').then(notifications => {
        notifications.showNotification(message, type, duration);
    });
};

// ===========================================
// GESTION DE LA VISIBILITÉ DE LA PAGE
// ===========================================
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // La page redevient visible, mettre à jour les données
        updateTasksList();
        
        if (window.location.pathname.includes('tasks.html')) {
            updateFullDashboard();
        }
    }
});

// ===========================================
// GESTION DU REDIMENSIONNEMENT
// ===========================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculer les positions des animations si nécessaire
        if (typeof window.initAllAnimations === 'function') {
            // Redémarrer les animations après redimensionnement
            initAllAnimations();
        }
    }, 250);
});

// ===========================================
// SAUVEGARDE AVANT FERMETURE
// ===========================================
window.addEventListener('beforeunload', () => {
    // Sauvegarder les données avant fermeture
    import('./utils/storage.js').then(storage => {
        storage.saveTasksToStorage();
    });
});

// ===========================================
// EXPOSITION GLOBALE POUR LE DEBUGGING
// ===========================================
if (typeof window !== 'undefined' && process?.env?.NODE_ENV === 'development') {
    window.SilexApp = {
        tasks: () => import('./core/config.js').then(config => config.tasks),
        reloadTasks: () => {
            loadTasksFromStorage();
            updateTasksList();
        },
        clearData: () => import('./utils/storage.js').then(storage => storage.clearTasksStorage()),
        exportData: () => import('./utils/storage.js').then(storage => storage.exportTasksToJSON())
    };
}
