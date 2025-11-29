# 🚀 Nexus226 - Quick Start Guide

## Installation Rapide

### 1. Installer les dépendances
```bash
cd "c:\Users\yanto_slqpq0c\Downloads\Lists of projects\nexus"
npm install
```

### 2. Configuration Supabase

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_key
```

> **Note**: Vous pouvez trouver ces valeurs dans votre dashboard Supabase sous Settings > API

### 3. Lancer le serveur de développement
```bash
npm run dev
```

### 4. Ouvrir dans le navigateur
```
http://localhost:3000
```

---

## 🗄️ Configuration de la Base de Données Supabase

### Créer les Tables

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'banned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service proposals table
CREATE TABLE service_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES service_proposals(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin logs table
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('IA', 'Services d''intelligence artificielle'),
  ('Développement', 'Services de développement web et logiciel'),
  ('Design', 'Services de design graphique et UX/UI'),
  ('Marketing', 'Services de marketing digital'),
  ('Autres', 'Autres services');
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services FOR SELECT USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Users can create services" ON services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own services" ON services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own services" ON services FOR DELETE USING (auth.uid() = user_id);

-- Service proposals policies
CREATE POLICY "Users can view proposals for their services" ON service_proposals FOR SELECT 
  USING (user_id = auth.uid() OR service_id IN (SELECT id FROM services WHERE user_id = auth.uid()));
CREATE POLICY "Users can create proposals" ON service_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages in their proposals" ON chat_messages FOR SELECT
  USING (proposal_id IN (
    SELECT id FROM service_proposals 
    WHERE user_id = auth.uid() OR service_id IN (SELECT id FROM services WHERE user_id = auth.uid())
  ));
CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

---

## 🎨 Tester l'Interface

### États à Vérifier

1. **Mode Visiteur (Non connecté)**
   - ✅ Barre de recherche verrouillée
   - ✅ Tooltip au survol
   - ✅ Modal de connexion au clic
   - ✅ Boutons "Se Connecter" et "S'inscrire" dans le header

2. **Mode Utilisateur (Connecté)**
   - ✅ Barre de recherche déverrouillée
   - ✅ Avatar et @username dans le header
   - ✅ Accès aux fonctionnalités

3. **Mode Admin**
   - ✅ Lien "Dashboard" visible
   - ✅ Badge admin

---

## 📦 Structure des Fichiers Clés

```
nexus/
├── app/
│   ├── layout.tsx          # Layout racine
│   └── page.tsx            # Page d'accueil
├── components/
│   ├── auth/
│   │   └── LoginModal.tsx  # Modal de connexion
│   ├── common/
│   │   └── LockedSearchBar.tsx  # 🔒 Recherche verrouillée
│   ├── layout/
│   │   └── Header.tsx      # En-tête
│   └── services/
│       └── ServiceCard.tsx # Carte de service
├── lib/
│   └── auth.tsx            # Context d'authentification
└── styles/
    └── globals.css         # Thème Neon Dark
```

---

## 🐛 Dépannage

### Erreur: "Cannot find module '@/...'"
**Solution**: Vérifiez que `tsconfig.json` contient :
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Erreur: Supabase connection failed
**Solution**: 
1. Vérifiez que `.env.local` existe et contient les bonnes valeurs
2. Redémarrez le serveur de développement
3. Vérifiez que votre projet Supabase est actif

### Styles ne s'appliquent pas
**Solution**:
1. Vérifiez que `globals.css` est importé dans `layout.tsx`
2. Vérifiez que Tailwind est configuré correctement
3. Redémarrez le serveur

---

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ Checklist de Démarrage

- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env.local` créé avec les clés Supabase
- [ ] Tables créées dans Supabase
- [ ] RLS configuré
- [ ] Catégories par défaut insérées
- [ ] Serveur de développement lancé (`npm run dev`)
- [ ] Page accessible sur `http://localhost:3000`
- [ ] Thème Neon Dark visible
- [ ] Barre de recherche verrouillée fonctionne

---

**Prêt à commencer !** 🚀
