# Guide de Déploiement Vercel - NexusHub

## ✅ Étape 1 : Push GitHub (TERMINÉ)
Le code a été poussé avec succès vers `https://github.com/Sigmales/Nexus226.git`

---

## 🚀 Étape 2 : Déploiement Vercel

### Option A : Via Dashboard Vercel (Recommandé)

1. **Accéder à Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Se connecter avec votre compte GitHub

2. **Créer un Nouveau Projet**
   - Cliquer sur "Add New..." → "Project"
   - Chercher et sélectionner `Sigmales/Nexus226`
   - Cliquer "Import"

3. **Configurer le Projet**
   - **Framework Preset:** Next.js (détecté automatiquement)
   - **Root Directory:** `./` (laisser par défaut)
   - **Build Command:** `npm run build` (par défaut)
   - **Output Directory:** `.next` (par défaut)

4. **Ajouter les Variables d'Environnement**
   Cliquer sur "Environment Variables" et ajouter :

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ```

   **Où trouver ces valeurs ?**
   - Aller sur [app.supabase.com](https://app.supabase.com)
   - Sélectionner votre projet
   - Settings → API
   - Copier les valeurs

5. **Déployer**
   - Cliquer "Deploy"
   - Attendre la fin du build (2-5 minutes)
   - Récupérer l'URL de production (ex: `nexus226.vercel.app`)

### Option B : Via CLI Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Suivre les prompts :
# - Link to existing project? No
# - Project name: Nexus226
# - Directory: ./
# - Override settings? No

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Redéployer avec les env vars
vercel --prod
```

---

## 📊 Étape 3 : Configuration Supabase

### Exécuter le Script SQL

1. **Accéder à Supabase SQL Editor**
   - Aller sur [app.supabase.com](https://app.supabase.com)
   - Sélectionner votre projet
   - Cliquer "SQL Editor" dans le menu

2. **Exécuter le Script**
   - Ouvrir `supabase/schema.sql` (dans votre projet local)
   - Copier tout le contenu
   - Coller dans SQL Editor
   - Cliquer "Run"

3. **Vérifier la Création**
   ```sql
   -- Vérifier que la table existe
   SELECT * FROM nexhub_services;
   
   -- Vérifier les RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'nexhub_services';
   ```

### Configurer les URLs Autorisées (Important !)

1. **Aller dans Authentication → URL Configuration**
2. **Ajouter les URLs Vercel :**
   - Site URL: `https://votre-app.vercel.app`
   - Redirect URLs:
     - `https://votre-app.vercel.app/**`
     - `http://localhost:3000/**` (pour dev local)

---

## 🧪 Étape 4 : Tests Post-Déploiement

### Test 1 : Accès à la Page Publique
1. Aller sur `https://votre-app.vercel.app/categories/nexushub`
2. Vérifier que la page s'affiche correctement
3. Devrait afficher "Aucun service disponible" (normal, aucun service créé)

### Test 2 : Connexion Admin
1. Aller sur `https://votre-app.vercel.app`
2. Se connecter avec un compte admin
3. Aller sur `/admin`
4. Vérifier que l'onglet "NexusHub" est visible

### Test 3 : Créer un Service
1. Dans `/admin` → onglet "NexusHub"
2. Cliquer "+ Ajouter un service"
3. Remplir le formulaire :
   - **Titre:** Formation Next.js
   - **Description:** Apprenez Next.js 14 avec TypeScript
   - **Prix:** 99.99
   - **Statut:** Actif
   - **Ordre:** 0
4. Cliquer "Créer"
5. Vérifier que le service apparaît dans la liste

### Test 4 : Vérifier l'Affichage Public
1. Aller sur `/categories/nexushub`
2. Vérifier que le service créé s'affiche
3. Cliquer "Commander"
4. Vérifier que le modal s'ouvre
5. Remplir et soumettre le formulaire

### Test 5 : Modifier un Service
1. Retourner sur `/admin` → NexusHub
2. Cliquer l'icône "Modifier" (crayon)
3. Changer le prix à 79.99
4. Cliquer "Mettre à jour"
5. Vérifier que le changement est visible

### Test 6 : Toggle Status
1. Cliquer sur le badge "Actif" du service
2. Vérifier qu'il passe à "Inactif"
3. Aller sur `/categories/nexushub`
4. Vérifier que le service n'apparaît plus (car inactif)
5. Réactiver le service

### Test 7 : Supprimer un Service
1. Cliquer l'icône "Supprimer" (poubelle)
2. Confirmer la suppression
3. Vérifier que le service disparaît de la liste

---

## 📱 Test Responsive

1. **Desktop** : Vérifier que la grille affiche 3 colonnes
2. **Tablet** : Vérifier que la grille affiche 2 colonnes
3. **Mobile** : Vérifier que la grille affiche 1 colonne

Utiliser les DevTools Chrome (F12) → Toggle Device Toolbar

---

## ✅ Checklist de Validation

- [ ] Déploiement Vercel réussi
- [ ] Variables d'environnement configurées
- [ ] Script SQL exécuté dans Supabase
- [ ] Page publique accessible
- [ ] Connexion admin fonctionnelle
- [ ] Création de service OK
- [ ] Affichage public OK
- [ ] Modal de contact OK
- [ ] Modification de service OK
- [ ] Toggle status OK
- [ ] Suppression de service OK
- [ ] Responsive desktop/mobile OK

---

## 🐛 Troubleshooting

### Erreur : "Failed to fetch services"
- Vérifier que le script SQL a été exécuté
- Vérifier les variables d'environnement Vercel
- Vérifier les RLS policies dans Supabase

### Erreur : "Unauthorized" lors de la création
- Vérifier que l'utilisateur a le rôle `admin` dans la table `users`
- Vérifier les RLS policies pour `nexhub_services`

### Services ne s'affichent pas sur la page publique
- Vérifier que le statut est "Actif"
- Vérifier la console navigateur pour erreurs
- Vérifier l'API : `https://votre-app.vercel.app/api/nexhub/services`

### Build Vercel échoue
- Vérifier les erreurs TypeScript
- Vérifier que toutes les dépendances sont dans `package.json`
- Vérifier les logs de build dans Vercel Dashboard

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs Vercel (Deployments → Logs)
2. Vérifier la console navigateur (F12)
3. Vérifier les logs Supabase (Logs & Reports)

---

## 🎉 Félicitations !

Une fois tous les tests passés, NexusHub est **100% opérationnel** en production ! 🚀
