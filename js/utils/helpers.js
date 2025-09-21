// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================

// ===========================================
// FORMATAGE DES DATES
// ===========================================
export function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export function formatDateTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function calculateDaysRemaining(deadline) {
    if (!(deadline instanceof Date)) {
        deadline = new Date(deadline);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getRelativeTimeString(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
        return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
        return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
        return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
        return 'à l\'instant';
    }
}

// ===========================================
// TRADUCTION DES STATUTS ET DOMAINES
// ===========================================
export function getStatusText(status) {
    const statusMap = {
        'todo': 'À faire',
        'in-progress': 'En cours',
        'review': 'En révision',
        'done': 'Terminé',
        'blocked': 'Bloqué',
        'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
}

export function getDomainText(domain) {
    const domainMap = {
        'work': 'Professionnel',
        'personal': 'Personnel',
        'education': 'Éducation',
        'health': 'Santé',
        'finance': 'Finance',
        'hobby': 'Loisir',
        'family': 'Famille',
        'travel': 'Voyage',
        'other': 'Autre'
    };
    return domainMap[domain] || domain;
}

export function getStatusColor(status) {
    const colorMap = {
        'todo': '#6c757d',
        'in-progress': '#007bff',
        'review': '#ffc107',
        'done': '#28a745',
        'blocked': '#dc3545',
        'cancelled': '#6c757d'
    };
    return colorMap[status] || '#6c757d';
}

export function getPriorityColor(priority) {
    if (priority >= 80) return '#dc3545'; // Rouge - Très haute
    if (priority >= 60) return '#fd7e14'; // Orange - Haute
    if (priority >= 40) return '#ffc107'; // Jaune - Moyenne
    if (priority >= 20) return '#20c997'; // Teal - Basse
    return '#6c757d'; // Gris - Très basse
}

export function getDifficultyColor(difficulty) {
    if (difficulty >= 8) return '#dc3545'; // Rouge - Très difficile
    if (difficulty >= 6) return '#fd7e14'; // Orange - Difficile
    if (difficulty >= 4) return '#ffc107'; // Jaune - Moyen
    if (difficulty >= 2) return '#20c997'; // Teal - Facile
    return '#28a745'; // Vert - Très facile
}

// ===========================================
// VALIDATION DES DONNÉES
// ===========================================
export function validateTaskData(task) {
    const errors = [];
    
    if (!task.title || task.title.trim().length === 0) {
        errors.push('Le titre est obligatoire');
    }
    
    if (!task.deadline || !(task.deadline instanceof Date) || isNaN(task.deadline.getTime())) {
        errors.push('La date limite est invalide');
    }
    
    if (task.difficulty && (task.difficulty < 1 || task.difficulty > 10)) {
        errors.push('La difficulté doit être entre 1 et 10');
    }
    
    if (task.priority && (task.priority < 0 || task.priority > 100)) {
        errors.push('La priorité doit être entre 0 et 100');
    }
    
    return errors;
}

export function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===========================================
// UTILITAIRES GÉNÉRAUX
// ===========================================
export function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

export function capitalizeFirst(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}