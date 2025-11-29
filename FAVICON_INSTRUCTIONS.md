# Instructions pour ajouter le Favicon Nexus226

## Fichiers à créer dans `/public`

Vous devez placer votre image de favicon (la lettre 'N' stylisée en circuit imprimé néon avec '226') dans le dossier `public` avec les formats suivants :

### 1. Favicon ICO (requis)
- **Fichier** : `public/favicon.ico`
- **Taille** : 32x32 pixels
- **Format** : ICO (peut être converti depuis PNG)

### 2. PNG Favicons (recommandé)
- **Fichier** : `public/favicon-16x16.png`
  - Taille : 16x16 pixels
  - Format : PNG

- **Fichier** : `public/favicon-32x32.png`
  - Taille : 32x32 pixels
  - Format : PNG

### 3. Apple Touch Icon (pour iOS/Safari)
- **Fichier** : `public/apple-touch-icon.png`
  - Taille : 180x180 pixels
  - Format : PNG

## Outils de Conversion Recommandés

### En ligne (gratuit)
1. **Favicon.io** : https://favicon.io/
   - Upload votre image PNG
   - Génère automatiquement tous les formats nécessaires

2. **RealFaviconGenerator** : https://realfavicongenerator.net/
   - Upload votre image
   - Prévisualise sur différents navigateurs/plateformes
   - Génère un package complet

### Ligne de commande (ImageMagick)
```bash
# Convertir PNG en ICO
convert favicon.png -define icon:auto-resize=32,16 favicon.ico

# Redimensionner pour différentes tailles
convert favicon.png -resize 16x16 favicon-16x16.png
convert favicon.png -resize 32x32 favicon-32x32.png
convert favicon.png -resize 180x180 apple-touch-icon.png
```

## Vérification

Après avoir placé les fichiers :

1. **Redémarrez le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Videz le cache du navigateur** :
   - Chrome/Edge : Ctrl+Shift+Delete
   - Firefox : Ctrl+Shift+Delete
   - Safari : Cmd+Option+E

3. **Vérifiez dans le navigateur** :
   - Le favicon doit apparaître dans l'onglet
   - Vérifiez aussi dans les favoris
   - Testez sur mobile (Apple Touch Icon)

## Structure Finale

```
nexus/
├── public/
│   ├── favicon.ico              ← 32x32 ICO
│   ├── favicon-16x16.png        ← 16x16 PNG
│   ├── favicon-32x32.png        ← 32x32 PNG
│   └── apple-touch-icon.png     ← 180x180 PNG
└── app/
    └── layout.tsx               ← Déjà configuré ✓
```

## Notes

- ✅ Le fichier `app/layout.tsx` a déjà été mis à jour avec les métadonnées appropriées
- ✅ Next.js détectera automatiquement les fichiers dans `/public`
- ⚠️ Assurez-vous que votre image source a un fond transparent ou un fond sombre pour correspondre au thème
- 💡 Pour de meilleurs résultats, utilisez une image source d'au moins 512x512 pixels
