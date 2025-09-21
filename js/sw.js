// Service Worker pour les optimisations de performance
// Projet Silex - Gestion des tâches optimisée

const CACHE_NAME = 'silex-v1.0.0';
const STATIC_CACHE = 'silex-static-v1.0.0';

// Ressources à mettre en cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/tasks.html',
    '/management.html',
    '/css/style.css',
    '/js/main.js',
    '/assets/logo.svg'
];

// Installation du service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Cache ouvert');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('Service Worker: Erreur lors de la mise en cache:', error);
            })
    );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Suppression du cache obsolète:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Stratégie de cache : Cache First pour les ressources statiques
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorer les requêtes externes (CDN, etc.)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retourner depuis le cache si disponible
                if (response) {
                    return response;
                }

                // Sinon, faire la requête réseau
                return fetch(event.request)
                    .then((response) => {
                        // Vérifier si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloner la réponse pour la mettre en cache
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Erreur de réseau:', error);
                        
                        // Retourner une page d'erreur basique si disponible
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Optimisations pour les performances
self.addEventListener('backgroundsync', (event) => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(
            // Synchroniser les tâches en arrière-plan
            syncTasks()
        );
    }
});

// Fonction de synchronisation des tâches
async function syncTasks() {
    try {
        // Récupérer les tâches en attente depuis IndexedDB
        const pendingTasks = await getPendingTasks();
        
        // Synchroniser avec le serveur si disponible
        for (const task of pendingTasks) {
            await syncTaskWithServer(task);
        }
        
        console.log('Service Worker: Synchronisation des tâches terminée');
    } catch (error) {
        console.error('Service Worker: Erreur de synchronisation:', error);
    }
}

// Simuler la récupération des tâches en attente
async function getPendingTasks() {
    // Cette fonction serait connectée à IndexedDB dans une version complète
    return [];
}

// Simuler la synchronisation avec le serveur
async function syncTaskWithServer(task) {
    // Cette fonction enverrait les données au serveur dans une version complète
    console.log('Synchronisation de la tâche:', task);
}