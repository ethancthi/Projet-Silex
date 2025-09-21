// ===========================================
// ANIMATIONS ET EFFETS VISUELS
// ===========================================

import { performanceConfig } from '../core/config.js';

// ===========================================
// EFFET DE CURSEUR PERSONNALISÉ
// ===========================================
let cursorTrail = [];
const maxTrailLength = 20;

export function initCursorEffects() {
    if (!performanceConfig.enableCursorEffects) return;
    
    // Créer le curseur personnalisé
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '💀';
    document.body.appendChild(cursor);
    
    // Créer la traînée du curseur
    for (let i = 0; i < maxTrailLength; i++) {
        const trailElement = document.createElement('div');
        trailElement.className = 'cursor-trail';
        trailElement.style.opacity = (maxTrailLength - i) / maxTrailLength * 0.5;
        document.body.appendChild(trailElement);
        cursorTrail.push(trailElement);
    }
    
    // Suivre le mouvement de la souris
    document.addEventListener('mousemove', updateCursorPosition);
    
    // Cacher le curseur par défaut
    document.body.style.cursor = 'none';
}

function updateCursorPosition(e) {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
    
    // Mettre à jour la traînée
    updateCursorTrail(e.clientX, e.clientY);
}

function updateCursorTrail(x, y) {
    // Décaler toutes les positions
    for (let i = cursorTrail.length - 1; i > 0; i--) {
        const current = cursorTrail[i];
        const previous = cursorTrail[i - 1];
        if (current && previous) {
            current.style.left = previous.style.left;
            current.style.top = previous.style.top;
        }
    }
    
    // Mettre la nouvelle position en tête
    if (cursorTrail[0]) {
        cursorTrail[0].style.left = x + 'px';
        cursorTrail[0].style.top = y + 'px';
    }
}

// ===========================================
// ANIMATIONS D'APPARITION
// ===========================================
export function animateElementsIn() {
    const elements = document.querySelectorAll('.animate-in');
    
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ===========================================
// EFFET DE RESPIRATION
// ===========================================
export function addBreathingEffect() {
    const breathingElements = document.querySelectorAll('.breathing');
    
    breathingElements.forEach(element => {
        const duration = 2000 + Math.random() * 1000; // 2-3 secondes
        element.style.animation = `breathing ${duration}ms ease-in-out infinite`;
        element.style.animationDelay = Math.random() * 2000 + 'ms';
    });
}

// ===========================================
// PARTICULES D'ARRIÈRE-PLAN
// ===========================================
export function initParticles() {
    if (!performanceConfig.enableParticles) return;
    
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    document.body.appendChild(particleContainer);
    
    // Créer les particules
    for (let i = 0; i < performanceConfig.particleCount; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Position aléatoire
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Taille aléatoire
    const size = 2 + Math.random() * 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Animation aléatoire
    const duration = 10000 + Math.random() * 20000; // 10-30 secondes
    particle.style.animationDuration = duration + 'ms';
    particle.style.animationDelay = Math.random() * duration + 'ms';
    
    container.appendChild(particle);
    
    // Recréer la particule quand l'animation se termine
    particle.addEventListener('animationiteration', () => {
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
    });
}

// ===========================================
// ANIMATIONS DES TÂCHES
// ===========================================
export function animateTaskCard(taskCard) {
    if (!taskCard) return;
    
    // Animation d'apparition
    taskCard.style.opacity = '0';
    taskCard.style.transform = 'scale(0.8) translateY(20px)';
    
    requestAnimationFrame(() => {
        taskCard.style.transition = 'all 0.3s ease';
        taskCard.style.opacity = '1';
        taskCard.style.transform = 'scale(1) translateY(0)';
    });
}

export function animateTaskRemoval(taskCard, callback) {
    if (!taskCard) return;
    
    taskCard.style.transition = 'all 0.3s ease';
    taskCard.style.transform = 'scale(0.8) translateX(-20px)';
    taskCard.style.opacity = '0';
    
    setTimeout(() => {
        if (callback) callback();
    }, 300);
}

// ===========================================
// EFFETS DE SURVOL
// ===========================================
export function initHoverEffects() {
    // Effet de survol pour les cartes de tâches
    document.addEventListener('mouseenter', (e) => {
        if (e.target.matches('.task-card')) {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
            e.target.style.boxShadow = '0 10px 30px rgba(139, 0, 0, 0.3)';
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.matches('.task-card')) {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '';
        }
    }, true);
    
    // Effet de survol pour les boutons
    document.addEventListener('mouseenter', (e) => {
        if (e.target.matches('button:not(.no-hover)')) {
            e.target.style.transform = 'scale(1.05)';
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.matches('button:not(.no-hover)')) {
            e.target.style.transform = 'scale(1)';
        }
    }, true);
}

// ===========================================
// ANIMATIONS DE CHARGEMENT
// ===========================================
export function showLoadingAnimation(element, text = 'Chargement...') {
    if (!element) return;
    
    const loadingHTML = `
        <div class="loading-animation">
            <div class="loading-spinner"></div>
            <div class="loading-text">${text}</div>
        </div>
    `;
    
    element.innerHTML = loadingHTML;
}

export function hideLoadingAnimation(element, originalContent = '') {
    if (!element) return;
    
    const loadingElement = element.querySelector('.loading-animation');
    if (loadingElement) {
        loadingElement.style.opacity = '0';
        setTimeout(() => {
            element.innerHTML = originalContent;
        }, 300);
    }
}

// ===========================================
// GESTION DES PERFORMANCES
// ===========================================
export function toggleAnimations(enable) {
    const stylesheet = document.createElement('style');
    stylesheet.id = 'animation-toggle';
    
    if (!enable) {
        stylesheet.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
    }
    
    // Remplacer l'ancien style s'il existe
    const existingStyle = document.getElementById('animation-toggle');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    if (!enable) {
        document.head.appendChild(stylesheet);
    }
}

// ===========================================
// INITIALISATION COMPLÈTE DES ANIMATIONS
// ===========================================
export function initAllAnimations() {
    if (!performanceConfig.enableAnimations) {
        toggleAnimations(false);
        return;
    }
    
    initCursorEffects();
    initParticles();
    initHoverEffects();
    addBreathingEffect();
    
    // Animer les éléments au chargement
    setTimeout(() => {
        animateElementsIn();
    }, 100);
}

// Redémarrer les animations quand la page devient visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && performanceConfig.enableAnimations) {
        addBreathingEffect();
    }
});