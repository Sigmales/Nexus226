# Favicon Nexus226 - Guide de Conversion

## Image Source
Votre favicon a été copié dans : `public/favicon-source.jpg`

## Conversion Nécessaire

Comme l'image est au format JPG, vous devez la convertir en PNG et ICO pour une meilleure compatibilité.

### Option 1 : Utiliser un outil en ligne (RECOMMANDÉ)

1. **Allez sur** : https://favicon.io/favicon-converter/
2. **Uploadez** : `public/favicon-source.jpg`
3. **Téléchargez** le package généré
4. **Extrayez** les fichiers dans le dossier `public/` :
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`

### Option 2 : Utiliser ImageMagick (ligne de commande)

Si vous avez ImageMagick installé :

```powershell
# Naviguer vers le dossier public
cd "c:\Users\yanto_slqpq0c\Downloads\Lists of projects\nexus\public"

# Convertir en PNG de différentes tailles
magick favicon-source.jpg -resize 16x16 favicon-16x16.png
magick favicon-source.jpg -resize 32x32 favicon-32x32.png
magick favicon-source.jpg -resize 180x180 apple-touch-icon.png

# Créer le fichier ICO
magick favicon-source.jpg -define icon:auto-resize=32,16 favicon.ico
```

### Option 3 : Utiliser Paint.NET ou GIMP

1. Ouvrez `favicon-source.jpg` dans Paint.NET ou GIMP
2. Redimensionnez à 32x32 pixels
3. Exportez en PNG : `favicon-32x32.png`
4. Répétez pour les autres tailles (16x16, 180x180)
5. Pour le .ico, utilisez un plugin ICO ou un convertisseur en ligne

## Vérification

Après avoir placé les fichiers, vérifiez que vous avez :

```
public/
├── favicon-source.jpg       ← Image originale (peut être supprimée après conversion)
├── favicon.ico              ← Format ICO (32x32)
├── favicon-16x16.png        ← PNG 16x16
├── favicon-32x32.png        ← PNG 32x32
└── apple-touch-icon.png     ← PNG 180x180
```

Ensuite :
1. Redémarrez le serveur : `npm run dev`
2. Videz le cache du navigateur (Ctrl+Shift+Delete)
3. Rechargez la page

Le favicon devrait maintenant apparaître ! 🎨
