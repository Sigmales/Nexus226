# Chat Message Auto-Deletion - Guide

## Mise en Place

### 1. Exécuter le Script SQL
Exécutez `setup_chat_cleanup_cron.sql` dans Supabase SQL Editor pour :
- Activer l'extension `pg_cron`
- Créer la fonction de nettoyage
- Planifier l'exécution quotidienne (2h00 UTC)

### 2. Vérification
Après exécution, vérifiez que le job est planifié :
```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-old-chat-messages';
```

### 3. Test Manuel (Optionnel)
Testez la fonction immédiatement :
```sql
SELECT * FROM cleanup_old_chat_messages();
```

## Nettoyage des Images (Storage)

Les images dans le bucket `chat-images` ne sont **pas** automatiquement supprimées par le job SQL.

### Option 1 : Règles de Cycle de Vie (Recommandé)
1. Allez dans **Supabase Dashboard > Storage > chat-images**
2. Cliquez sur **Settings** (icône engrenage)
3. Ajoutez une règle de cycle de vie :
   - **Delete files older than:** `7 days`

### Option 2 : Fonction SQL Étendue
Si les règles de cycle de vie ne sont pas disponibles, modifiez la fonction pour supprimer les images :
```sql
-- À ajouter dans cleanup_old_chat_messages() avant le DELETE
-- Récupérer les URLs des images à supprimer
SELECT image_url INTO image_urls_array
FROM chat_messages
WHERE created_at < NOW() - INTERVAL '7 days'
AND image_url IS NOT NULL;

-- Puis utiliser une fonction Storage pour les supprimer
-- (Nécessite une extension ou un Edge Function)
```

## Monitoring

### Consulter l'Historique d'Exécution
```sql
SELECT 
  jobid,
  runid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job 
  WHERE jobname = 'cleanup-old-chat-messages'
)
ORDER BY start_time DESC 
LIMIT 10;
```

### Désactiver le Job (si nécessaire)
```sql
SELECT cron.unschedule('cleanup-old-chat-messages');
```

### Réactiver le Job
Réexécutez la partie "Schedule" du script `setup_chat_cleanup_cron.sql`.

## Notes Importantes

- **Timezone:** Le cron s'exécute en **UTC**. 2h00 UTC = 3h00 CET (hiver) ou 4h00 CEST (été).
- **Sauvegardes:** Les messages supprimés peuvent être récupérés via les sauvegardes Supabase (si activées).
- **Performance:** La suppression est optimisée par l'index sur `created_at`.
