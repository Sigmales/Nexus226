# Configuration des Politiques Storage - chat-images

## Problème
Erreur "PGRST204" lors de l'upload → Les politiques RLS du bucket ne sont pas configurées.

## Solution : Ajouter les Politiques via l'Interface

### Étape 1 : Accéder aux Politiques
1. Allez dans **Storage** → **Policies**
2. Ou allez dans **Storage** → cliquez sur `chat-images` → onglet **Policies**

### Étape 2 : Créer la Politique d'Upload (INSERT)
1. Cliquez sur **"New Policy"**
2. Sélectionnez **"For full customization"** ou **"Custom"**
3. Configurez :
   - **Policy name**: `Users can upload images`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **USING expression**: Laissez vide ou `true`
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
4. Cliquez sur **"Review"** puis **"Save policy"**

### Étape 3 : Créer la Politique de Lecture (SELECT)
1. Cliquez sur **"New Policy"** à nouveau
2. Configurez :
   - **Policy name**: `Anyone can view images`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public` (ou `authenticated` si vous préférez)
   - **USING expression**:
     ```sql
     bucket_id = 'chat-images'
     ```
3. Cliquez sur **"Review"** puis **"Save policy"**

### Étape 4 : (Optionnel) Politique de Suppression
1. Cliquez sur **"New Policy"**
2. Configurez :
   - **Policy name**: `Users can delete own images`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **USING expression**:
     ```sql
     bucket_id = 'chat-images' AND (storage.foldername(name))[1] = auth.uid()::text
     ```
3. Cliquez sur **"Review"** puis **"Save policy"**

## Vérification
Après avoir créé ces politiques, testez à nouveau l'upload d'images dans le chat.

## Alternative Rapide
Si l'interface est compliquée, vous pouvez aussi :
1. Supprimer le bucket `chat-images`
2. Le recréer en cochant **"Public bucket"**
3. Supabase devrait créer automatiquement les politiques de base
