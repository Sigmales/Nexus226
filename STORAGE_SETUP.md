# Instructions - Créer le Bucket Storage pour le Chat

## Étapes à Suivre

1. **Ouvrez votre Dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez à Storage**
   - Cliquez sur "Storage" dans le menu de gauche

3. **Créez un Nouveau Bucket**
   - Cliquez sur le bouton "New bucket"
   - Remplissez les informations :
     - **Name**: `chat-images`
     - **Public bucket**: ✅ **COCHÉ** (important !)
     - **File size limit**: `5242880` (5MB)
     - **Allowed MIME types**: Laissez vide ou mettez `image/*`

4. **Créez le Bucket**
   - Cliquez sur "Create bucket"

5. **Testez l'Upload**
   - Retournez sur votre application
   - Essayez d'envoyer une image dans le chat
   - Ça devrait fonctionner !

## Pourquoi cette méthode ?

Le SQL ne fonctionne pas car vous n'avez pas les permissions pour modifier la table `storage.objects` directement. L'interface Supabase gère automatiquement toutes les permissions et politiques RLS pour vous.

## Vérification

Une fois le bucket créé, vous devriez voir :
- Un dossier "chat-images" dans Storage
- Les images uploadées apparaissent dans le chat
- Pas d'erreur "Erreur lors de l'upload"
