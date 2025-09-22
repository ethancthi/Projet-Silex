// ===========================================
// CONFIGURATION ET CONSTANTES GLOBALES
// ===========================================

// Variables globales d'état
export let tasks = [];
export let currentFilter = 'all';
export let taskIdCounter = 1;

// Système audio
export let audioContext = null;
export let audioEnabled = false;
export let audioInitialized = false;

// Configuration de l'application
export const CONFIG = {
    STORAGE_KEY: 'silexTasks',
    COUNTER_KEY: 'silexTaskCounter',
    AUDIO_KEY: 'silexAudioEnabled',
    
    // Animations
    ANIMATION_DURATIONS: {
        short: 200,
        normal: 300,
        long: 500
    },
    
    // Audio
    AUDIO: {
        FREQUENCIES: {
            click: 120,
            hover: 200,
            complete: [130.81, 164.81, 196.00], // C3, E3, G3
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
    
    // Performance
    PERFORMANCE: {
        enableAnimations: true,
        enableCursorEffects: true,
        enableParticles: true,
        particleCount: 20,
        MAX_PARTICLES: 100,
        PARTICLE_CLEANUP_INTERVAL: 10000
    },
    
    // Timing
    AMBIENT_SOUND_INTERVAL: [8000, 12000] // Min, Max milliseconds
};

// Setters pour les variables globales
export function setTasks(newTasks) {
    tasks = newTasks;
}

export function setCurrentFilter(filter) {
    currentFilter = filter;
}

export function setTaskIdCounter(counter) {
    taskIdCounter = counter;
}

export function setAudioContext(context) {
    audioContext = context;
}

export function setAudioEnabled(enabled) {
    audioEnabled = enabled;
}

export function setAudioInitialized(initialized) {
    audioInitialized = initialized;
}

// Helpers pour l'état
export function incrementTaskIdCounter() {
    return ++taskIdCounter;
}

export function getTasks() {
    return tasks;
}

export function getCurrentFilter() {
    return currentFilter;
}

export function getTaskIdCounter() {
    return taskIdCounter;
}

export function isAudioEnabled() {
    return audioEnabled;
}

export function isAudioInitialized() {
    return audioInitialized;
}

export function getAudioContext() {
    return audioContext;
}