# Nexus226 - Plateforme de Services IA

![Nexus226](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ecf8e?style=for-the-badge&logo=supabase)

**Nexus226** est une plateforme moderne dédiée aux services d'intelligence artificielle, avec un design futuriste Neon Dark et une expérience utilisateur premium.

## ✨ Caractéristiques

### 🎨 Design Neon Dark
- Thème sombre futuriste avec effets néon (or, cyan, magenta, violet)
- Animations fluides et micro-interactions
- Effets de glow et ombres néon
- Typographie premium (Inter + Orbitron)

### 🔐 Authentification Intelligente
- **Recherche verrouillée** : Accès à la recherche IA réservé aux utilisateurs connectés
- Système de rôles (User, Admin, Banned)
- Intégration Supabase Auth
- Gestion de session sécurisée

### 🎯 Composants Clés

#### Header
- Navigation par catégories (IA en premier)
- États d'authentification dynamiques
- Lien admin pour les administrateurs
- Menu mobile responsive

#### LockedSearchBar **[CRITIQUE]**
- Verrouillage visuel pour les visiteurs
- Tooltip informatif au survol
- Déclenchement du modal de connexion
- Recherche active pour les utilisateurs connectés

#### ServiceCard
- Badges dynamiques (Nouveau, Proposé par)
- Affichage des catégories et prix
- Indicateurs de statut
- Effets hover avec gradient néon

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Étapes

1. **Cloner le projet**
```bash
cd nexus
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**

Créez un fichier `.env.local` à la racine :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du Projet

```
nexus/
├── app/
│   ├── layout.tsx          # Layout racine avec AuthProvider
│   └── page.tsx            # Page d'accueil
├── components/
│   ├── auth/
│   │   └── LoginModal.tsx  # Modal de connexion/inscription
│   ├── common/
│   │   └── LockedSearchBar.tsx  # Barre de recherche verrouillée
│   ├── layout/
│   │   └── Header.tsx      # En-tête avec navigation
│   └── services/
│       └── ServiceCard.tsx # Carte de service
├── lib/
│   └── auth.tsx            # Context d'authentification
├── styles/
│   └── globals.css         # Styles globaux + thème Neon Dark
├── types/
│   ├── database.ts         # Types de base de données
│   └── supabase-generated.ts  # Types générés Supabase
├── tailwind.config.ts      # Configuration Tailwind
├── tsconfig.json           # Configuration TypeScript
└── package.json
```

## 🎨 Thème Neon Dark

### Couleurs Principales
```css
--accent-primary: #FFD700    /* Or néon */
--accent-secondary: #00FFFF  /* Cyan néon */
--accent-tertiary: #FF00FF   /* Magenta néon */
--accent-purple: #9D4EDD     /* Violet néon */
--bg-dark: #0a0e27           /* Fond sombre */
--bg-card: #0f1429           /* Fond carte */
```

### Classes Utilitaires

#### Boutons
- `.neon-button` - Bouton principal avec effet glow
- `.neon-button-secondary` - Bouton secondaire avec bordure

#### Cartes
- `.neon-glow` - Carte avec effet glow au survol
- `.service-card` - Carte de service avec animation

#### Badges
- `.badge-new` - Badge "Nouveau" avec pulse
- `.badge-user` - Badge utilisateur cyan
- `.badge-admin` - Badge admin violet

#### Inputs
- `.input-neon` - Input avec bordure néon au focus

## 🔧 Technologies

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript 5
- **Styling** : Tailwind CSS 3
- **Auth & Database** : Supabase
- **Fonts** : Inter (sans-serif), Orbitron (display)

## 📊 Schéma de Base de Données

### Tables Principales

- `users` - Profils utilisateurs avec rôles
- `categories` - Catégories de services
- `services` - Services proposés
- `service_proposals` - Propositions de services
- `chat_messages` - Messages de chat
- `admin_logs` - Logs d'administration

## 🎯 Workflow Utilisateur

### Scénario 1 : Recherche Verrouillée (IA-First, Auth-Gated)

1. **Visiteur** arrive sur la page d'accueil
2. Voit la barre de recherche **verrouillée** avec icône cadenas
3. Au survol : tooltip "Connexion requise pour la recherche IA"
4. Au clic : modal de connexion s'affiche
5. Après connexion : barre de recherche **déverrouillée**
6. Peut maintenant rechercher des services IA

## 🚧 Phases de Développement

### ✅ Phase 1 : Base de Données & Types
- Types Supabase générés
- Types d'interface personnalisés
- Schéma de base de données

### ✅ Phase 2 : Fondation Visuelle
- Thème Neon Dark
- Composants de layout (Header)
- Barre de recherche verrouillée
- Cartes de service
- Système d'authentification
- Page d'accueil

### 🔄 Phase 3 : Fonctionnalités (À venir)
- Recherche de services
- Pages de détail
- Dashboard admin
- Filtrage par catégorie
- Soumission de services

## 📝 Scripts Disponibles

```bash
npm run dev      # Lancer le serveur de développement
npm run build    # Build de production
npm run start    # Lancer le serveur de production
npm run lint     # Linter le code
```

## 🤝 Contribution

Ce projet suit les principes de design suivants :
- **IA-First** : L'IA est la catégorie prioritaire
- **Auth-Gated** : Fonctionnalités premium réservées aux utilisateurs
- **Neon Aesthetic** : Design futuriste avec effets néon
- **Premium UX** : Interactions fluides et micro-animations

## 📄 Licence

© 2025 Nexus226. Tous droits réservés.

---

**Développé avec** ⚡ **par l'équipe Nexus226**
