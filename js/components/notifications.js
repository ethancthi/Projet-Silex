// ===========================================
// SYSTÈME DE NOTIFICATIONS
// ===========================================

// ===========================================
// AFFICHAGE DES NOTIFICATIONS
// ===========================================
export function showNotification(message, type = 'info', duration = 3000) {
    // Créer le conteneur de notifications s'il n'existe pas
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} notification-enter`;
    
    // Icône selon le type
    const iconMap = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const icon = iconMap[type] || iconMap['info'];
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Ajouter au conteneur
    notificationContainer.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('notification-enter');
        notification.classList.add('notification-visible');
    }, 10);
    
    // Suppression automatique
    if (duration > 0) {
        setTimeout(() => {
            removeNotification(notification);
        }, duration);
    }
    
    return notification;
}

export function removeNotification(notification) {
    if (notification && notification.parentElement) {
        notification.classList.add('notification-exit');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }
}

export function clearAllNotifications() {
    const container = document.getElementById('notification-container');
    if (container) {
        const notifications = container.querySelectorAll('.notification');
        notifications.forEach(notification => {
            removeNotification(notification);
        });
    }
}

// ===========================================
// NOTIFICATIONS SPÉCIALISÉES
// ===========================================
export function showSuccessNotification(message, duration = 3000) {
    return showNotification(message, 'success', duration);
}

export function showErrorNotification(message, duration = 5000) {
    return showNotification(message, 'error', duration);
}

export function showWarningNotification(message, duration = 4000) {
    return showNotification(message, 'warning', duration);
}

export function showInfoNotification(message, duration = 3000) {
    return showNotification(message, 'info', duration);
}

// ===========================================
// NOTIFICATIONS AVEC ACTIONS
// ===========================================
export function showConfirmNotification(message, onConfirm, onCancel) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-confirm notification-enter';
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">❓</span>
            <span class="notification-message">${message}</span>
            <div class="notification-actions">
                <button class="notification-btn notification-btn-confirm">Confirmer</button>
                <button class="notification-btn notification-btn-cancel">Annuler</button>
            </div>
        </div>
    `;
    
    // Événements pour les boutons
    const confirmBtn = notification.querySelector('.notification-btn-confirm');
    const cancelBtn = notification.querySelector('.notification-btn-cancel');
    
    confirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        removeNotification(notification);
    });
    
    cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        removeNotification(notification);
    });
    
    // Ajouter au conteneur
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    notificationContainer.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('notification-enter');
        notification.classList.add('notification-visible');
    }, 10);
    
    return notification;
}

// ===========================================
// NOTIFICATIONS DE PROGRESSION
// ===========================================
export function showProgressNotification(message, progress = 0) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-progress notification-enter';
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">⏳</span>
            <div class="notification-text">
                <span class="notification-message">${message}</span>
                <div class="notification-progress-bar">
                    <div class="notification-progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="notification-progress-text">${progress}%</span>
            </div>
        </div>
    `;
    
    // Ajouter au conteneur
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    notificationContainer.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('notification-enter');
        notification.classList.add('notification-visible');
    }, 10);
    
    // Fonction pour mettre à jour le progrès
    notification.updateProgress = (newProgress, newMessage) => {
        const progressFill = notification.querySelector('.notification-progress-fill');
        const progressText = notification.querySelector('.notification-progress-text');
        const messageElement = notification.querySelector('.notification-message');
        
        if (progressFill) progressFill.style.width = `${newProgress}%`;
        if (progressText) progressText.textContent = `${newProgress}%`;
        if (newMessage && messageElement) messageElement.textContent = newMessage;
        
        // Si terminé, changer l'icône et fermer automatiquement
        if (newProgress >= 100) {
            const icon = notification.querySelector('.notification-icon');
            if (icon) icon.textContent = '✅';
            
            setTimeout(() => {
                removeNotification(notification);
            }, 2000);
        }
    };
    
    return notification;
}