// ===========================================
// SYSTÈME AUDIO
// ===========================================

import { audioConfig } from '../core/config.js';

let ambientAudio = null;
let clickAudio = null;

// ===========================================
// INITIALISATION AUDIO
// ===========================================
export function initAudio() {
    try {
        // Chargement de l'audio d'ambiance
        ambientAudio = new Audio(audioConfig.ambientSoundPath);
        ambientAudio.loop = true;
        ambientAudio.volume = audioConfig.ambientVolume;
        
        // Chargement du son de clic
        clickAudio = new Audio(audioConfig.clickSoundPath);
        clickAudio.volume = audioConfig.clickVolume;
        
        // Événements pour l'audio d'ambiance
        ambientAudio.addEventListener('canplaythrough', () => {
            console.log('Audio d\'ambiance prêt');
        });
        
        ambientAudio.addEventListener('error', (e) => {
            console.warn('Erreur lors du chargement de l\'audio d\'ambiance:', e);
        });
        
        // Événements pour le son de clic
        clickAudio.addEventListener('error', (e) => {
            console.warn('Erreur lors du chargement du son de clic:', e);
        });
        
        // Auto-play de l'ambiance (si autorisé par le navigateur)
        if (audioConfig.autoPlayAmbient) {
            playAmbientSound();
        }
        
    } catch (error) {
        console.warn('Erreur lors de l\'initialisation audio:', error);
    }
}

// ===========================================
// CONTRÔLE AUDIO D'AMBIANCE
// ===========================================
export function playAmbientSound() {
    if (ambientAudio && ambientAudio.paused) {
        ambientAudio.play().catch(e => {
            console.warn('Impossible de jouer l\'audio d\'ambiance (autoplay bloqué):', e);
        });
    }
}

export function pauseAmbientSound() {
    if (ambientAudio && !ambientAudio.paused) {
        ambientAudio.pause();
    }
}

export function toggleAmbientSound() {
    if (ambientAudio) {
        if (ambientAudio.paused) {
            playAmbientSound();
        } else {
            pauseAmbientSound();
        }
    }
}

export function setAmbientVolume(volume) {
    if (ambientAudio) {
        ambientAudio.volume = Math.max(0, Math.min(1, volume));
    }
}

// ===========================================
// EFFETS SONORES
// ===========================================
export function playClickSound() {
    if (clickAudio) {
        clickAudio.currentTime = 0; // Remettre au début pour pouvoir jouer rapidement
        clickAudio.play().catch(e => {
            console.warn('Impossible de jouer le son de clic:', e);
        });
    }
}

export function playNotificationSound() {
    // Utilise le même son que le clic pour l'instant
    playClickSound();
}

// ===========================================
// GESTION DES ÉVÉNEMENTS AUDIO
// ===========================================
export function setupAudioEvents() {
    // Ajouter des sons de clic aux boutons
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .clickable, .task-card, .modal-close')) {
            playClickSound();
        }
    });
    
    // Contrôles audio dans l'interface
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            toggleAmbientSound();
            updateAudioToggleUI();
        });
    }
    
    const audioVolumeSlider = document.getElementById('audio-volume');
    if (audioVolumeSlider) {
        audioVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            setAmbientVolume(volume);
        });
    }
}

function updateAudioToggleUI() {
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle && ambientAudio) {
        if (ambientAudio.paused) {
            audioToggle.textContent = '🔇';
            audioToggle.title = 'Activer l\'audio d\'ambiance';
        } else {
            audioToggle.textContent = '🔊';
            audioToggle.title = 'Désactiver l\'audio d\'ambiance';
        }
    }
}

// ===========================================
// ÉTAT AUDIO
// ===========================================
export function getAudioState() {
    return {
        ambientPlaying: ambientAudio && !ambientAudio.paused,
        ambientVolume: ambientAudio ? ambientAudio.volume : 0,
        clickVolume: clickAudio ? clickAudio.volume : 0
    };
}

export function isAudioSupported() {
    return typeof Audio !== 'undefined';
}