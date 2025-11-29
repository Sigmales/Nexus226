# Nexus226 - NexusHub Feature

Plateforme Next.js 14+ avec Supabase pour la gestion de services officiels NexusHub.

## 🚀 Stack Technique

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (thème Neon Dark)
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **Deployment:** Vercel

## 📦 Installation Locale

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/Sigmales/Nexus226.git
cd Nexus226
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
```bash
cp .env.example .env.local
```

Remplir `.env.local` avec vos credentials Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Configurer la base de données**

Exécuter le script SQL dans Supabase SQL Editor :
```bash
supabase/schema.sql
```

Ce script crée :
- Table `nexhub_services`
- Politiques RLS (public read, admin write)
- Indexes et triggers

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🎯 Fonctionnalités NexusHub

### Page Publique (`/categories/nexushub`)
- Affichage des services actifs
- Cartes interactives avec effet neon
- Modal de contact pour commandes
- Responsive (desktop + mobile)

### Dashboard Admin (`/admin` → onglet "NexusHub")
- **CRUD complet** : Créer, modifier, supprimer des services
- **Toggle status** : Activer/désactiver un service
- **Gestion de l'ordre** : Contrôler l'affichage via `display_order`
- **Upload d'icônes** : URL personnalisée pour chaque service
- **Filtres** : Voir tous, actifs, ou inactifs

## 🔐 Sécurité (RLS Policies)

### Table `nexhub_services`
- **SELECT (Public)** : Tout le monde peut voir les services actifs
- **SELECT (Admin)** : Les admins voient tous les services
- **INSERT/UPDATE/DELETE (Admin)** : Seuls les admins peuvent modifier

## 📡 API Routes

### GET `/api/nexhub/services`
- **Auth:** Public
- **Returns:** Liste des services actifs
- **Query params:** `?status=active|inactive` (admin only)

### POST `/api/nexhub/services`
- **Auth:** Admin only
- **Body:** `{ title, description, icon_url?, price?, status?, display_order? }`

### PUT `/api/nexhub/services/[id]`
- **Auth:** Admin only
- **Body:** Partial update

### DELETE `/api/nexhub/services/[id]`
- **Auth:** Admin only

## 🚀 Déploiement Vercel

### Via Dashboard Vercel

1. **Connecter le repository GitHub**
   - Aller sur [vercel.com](https://vercel.com)
   - Cliquer "New Project"
   - Importer `Sigmales/Nexus226`

2. **Configurer les variables d'environnement**
   - Ajouter les mêmes variables que `.env.local`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Déployer**
   - Cliquer "Deploy"
   - Attendre la fin du build
   - Récupérer l'URL de preview

### Via CLI Vercel

```bash
npm install -g vercel
vercel login
vercel
```

## 📝 Structure du Projet

```
app/
├── api/nexhub/services/
│   ├── route.ts (GET, POST)
│   └── [id]/route.ts (PUT, DELETE)
├── categories/nexushub/
│   └── page.tsx (Page publique)
└── admin/
    └── page.tsx (Dashboard admin)

components/
├── admin/
│   └── NexusHubManager.tsx (Gestion admin)
└── nexhub/
    ├── NexusServiceCard.tsx (Carte service)
    └── ContactModal.tsx (Modal contact)

supabase/
└── schema.sql (Schema + RLS)
```

## 🎨 Thème Neon Dark

### Couleurs
- **Primary:** `#FFD700` (neon-gold)
- **Secondary:** `#00FFFF` (neon-cyan)
- **Accent:** `#FF00FF` (neon-purple)
- **Background:** `#0A0A0F` (bg-dark)

### Classes Tailwind Personnalisées
- `neon-button` : Bouton avec effet glow
- `neon-glow` : Container avec bordure lumineuse
- `input-neon` : Input stylisé neon

## 🧪 Tests

### Test Manuel
1. Créer un service via `/admin` → NexusHub
2. Vérifier l'affichage sur `/categories/nexushub`
3. Tester le modal de contact
4. Toggle le statut (actif/inactif)
5. Supprimer le service

### Test API (Postman/cURL)
```bash
# GET services (public)
curl https://your-domain.vercel.app/api/nexhub/services

# POST service (admin - requires auth)
curl -X POST https://your-domain.vercel.app/api/nexhub/services \
  -H "Content-Type: application/json" \
  -d '{"title":"Formation Next.js","description":"...","price":99.99}'
```

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe Nexus226

## 📄 Licence

Propriétaire - Nexus226 © 2024
