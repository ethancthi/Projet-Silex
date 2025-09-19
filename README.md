# 🩸 Projet Silex - Gestionnaire de Tâches Organique

## 📋 Description

Silex est une plateforme de gestion de tâches avec une approche organique et immersive, développée selon un cahier des charges exigeant. L'application combine productivité et esthétique sombre pour une expérience utilisateur unique.

## ✨ Fonctionnalités Principales

### 🎯 Gestion de Tâches Avancée
- **Système hiérarchique de sous-tâches** avec indentation visuelle
- **Calcul automatique de progression** basé sur les sous-tâches
- **Interface CRUD complète** pour la gestion des tâches
- **Persistance des données** avec localStorage

### 🎵 Système Audio Immersif
- **Sons organiques synthétiques** générés via Web Audio API
- **Feedback audio contextuel** (clicks, hover, completion)
- **Son d'ambiance subtil** pour l'immersion
- **Optimisation de performance** avec initialisation différée

### 🎨 Animations Avancées
- **15+ animations CSS** personnalisées
- **Système de particules flottantes** avec JavaScript
- **Micro-interactions** sur tous les éléments
- **Animations d'entrée** avec Intersection Observer
- **Effets de morphing** et transitions organiques

### 📊 Dashboard Management
- **Statistiques en temps réel** des tâches et équipes
- **Filtrage par domaines** (Tech, Design, Marketing, etc.)
- **Système d'assignation** de tâches
- **Analytics avancées** de performance
- **Interface de gestion complète**

### 🚀 Optimisations de Performance
- **Progressive Web App (PWA)** avec manifest et service worker
- **Lazy loading** pour les images
- **Preloading** des ressources critiques
- **Compression GZIP/Brotli** via .htaccess
- **Cache strategies** optimisées
- **Réduction des animations** sur appareils moins puissants

## 🛠️ Architecture Technique

### Frontend
- **HTML5 sémantique** avec structure accessible
- **CSS3 avancé** avec custom properties et animations
- **JavaScript Vanilla** (pas de frameworks pour la performance)
- **Web Audio API** pour le système sonore
- **Service Worker** pour les capacités PWA

### Optimisations
- **Preconnect/Preload** pour les polices Google Fonts
- **Critical CSS inlining** via preload
- **Resource hints** pour l'optimisation du chargement
- **Responsive design** mobile-first
- **Accessibilité** avec support des préférences utilisateur

## 📁 Structure du Projet

```
Site KYF/
├── 📄 index.html          # Page d'accueil avec showcase
├── 📄 tasks.html          # Interface de gestion des tâches
├── 📄 management.html     # Dashboard de management
├── 📄 manifest.json       # Manifest PWA
├── 📄 sw.js              # Service Worker
├── 📄 .htaccess          # Optimisations serveur
├── 📂 css/
│   └── 📄 style.css      # Styles principaux (2000+ lignes)
├── 📂 js/
│   └── 📄 main.js        # Logique application (2000+ lignes)
└── 📂 assets/
    ├── 📂 images/        # Images et icônes PWA
    └── 📄 logo.svg       # Logo animé principal
```

## 🎨 Design System

### Palette de Couleurs
```css
--primary-dark: #0a0a0a     /* Noir profond */
--secondary-dark: #1a1a1a   /* Gris sombre */
--accent-red: #a31621       /* Rouge sang */
--accent-green: #2d5a27     /* Vert organique */
--secondary-orange: #d2691e /* Orange automnal */
--tertiary-purple: #4a148c  /* Violet mystique */
--text-light: #e8e8e8       /* Texte principal */
--text-muted: #b0b0b0       /* Texte secondaire */
```

### Typographie
- **Inter** - Interface principale (300-700)
- **Cinzel** - Titres élégants (400-600)
- **Crimson Text** - Texte de corps (400-600)
- **Source Code Pro** - Code et données (400-500)
- **Creepster** - Éléments décoratifs

## 🚀 Guide de Déploiement

### Prérequis
- Serveur web avec support .htaccess (Apache recommandé)
- HTTPS activé (requis pour PWA et Service Worker)
- Support des modules Apache : mod_deflate, mod_expires, mod_headers

### Installation
1. **Cloner/Télécharger** le projet
2. **Uploader** tous les fichiers sur le serveur
3. **Vérifier** que le .htaccess est actif
4. **Tester** l'accès HTTPS
5. **Valider** le manifest PWA

### Optimisations Post-Déploiement
- **Compresser** les images avec des outils comme TinyPNG
- **Générer** les icônes PWA aux différentes tailles
- **Configurer** un CDN si nécessaire
- **Monitorer** les performances avec Lighthouse

## 📱 Fonctionnalités PWA

### Installation
- **Installable** sur desktop et mobile
- **Icônes adaptatives** pour toutes les plateformes
- **Splash screen** personnalisé
- **Mode standalone** pour une expérience native

### Offline
- **Cache intelligent** des ressources statiques
- **Stratégie Cache First** pour les performances
- **Synchronisation** en arrière-plan (background sync)
- **Notifications** de mise à jour disponibles

## 🔧 Personnalisation

### Couleurs
Modifier les custom properties CSS dans `:root` pour changer la palette.

### Animations
Ajuster les durées dans `--animation-duration` ou désactiver via `prefers-reduced-motion`.

### Audio
Configurer les fréquences et gains dans les fonctions `createOrganicSound()`.

### Contenu
Personnaliser les textes, images et métadonnées dans les fichiers HTML.

## 🧪 Tests et Validation

### Performance
- **Lighthouse Score** : Viser 90+ sur toutes les métriques
- **WebPageTest** : Temps de chargement < 3s
- **GTmetrix** : Grade A sur performance

### Compatibilité
- **Chrome/Edge** : Support complet
- **Firefox** : Support avec fallbacks
- **Safari** : Support partiel du Web Audio API
- **Mobile** : Responsive design testé

### Accessibilité
- **WCAG 2.1 AA** : Contraste et navigation
- **Screen readers** : Structure sémantique
- **Keyboard navigation** : Focus management

## 📊 Métriques Cibles

### Performance
- **FCP** (First Contentful Paint) : < 2s
- **LCP** (Largest Contentful Paint) : < 3s
- **CLS** (Cumulative Layout Shift) : < 0.1
- **FID** (First Input Delay) : < 100ms

### Taille des Assets
- **CSS** : ~80KB non compressé
- **JavaScript** : ~120KB non compressé
- **Images** : Optimisées selon usage
- **Total page** : < 500KB initial

## 🐛 Dépannage

### Audio ne fonctionne pas
- Vérifier le support Web Audio API
- S'assurer d'une interaction utilisateur préalable
- Contrôler les paramètres de navigateur

### Animations lentes
- Vérifier `prefers-reduced-motion`
- Réduire le nombre de particules
- Désactiver les effets sur appareils faibles

### PWA non installable
- Valider le manifest.json
- Vérifier HTTPS
- Contrôler l'enregistrement du Service Worker

## 👥 Équipe et Contributions

Développé selon un cahier des charges exigeant avec attention particulière à :
- **Performance** et optimisation
- **Design organique** et esthétique sombre
- **Expérience utilisateur** immersive
- **Code maintenable** et documenté

## 📄 Licence

Projet éducatif - Utilisation libre avec attribution.

---

🩸 **Silex** - Où la productivité rencontre l'esthétique organique.