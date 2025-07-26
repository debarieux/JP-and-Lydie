# Configuration ImageKit.io pour la Galerie Privée

## 🚀 Avantages d'ImageKit.io

✅ **Optimisation automatique** des images (compression, redimensionnement)
✅ **CDN global** pour un chargement ultra-rapide
✅ **Transformations en temps réel** (redimensionnement, format, qualité)
✅ **Lazy loading** et responsive images automatiques
✅ **Stockage illimité** (selon ton plan)
✅ **API simple** et SDK JavaScript

## 📋 Étapes de configuration

### 1. Créer un compte ImageKit.io
- Va sur [https://imagekit.io/](https://imagekit.io/)
- Crée un compte gratuit (1000 transformations/mois)
- Choisis un nom pour ton endpoint

### 2. Récupérer les clés API
Dans ton dashboard ImageKit :
- **URL Endpoint** : `https://ik.imagekit.io/ton_endpoint`
- **Public Key** : `pk_...`
- **Private Key** : `private_...`

### 3. Configurer les variables d'environnement

#### Option A : Via le Dashboard Vercel
1. Va sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne ton projet "galerie-privee"
3. Va dans "Settings" → "Environment Variables"
4. Ajoute ces variables :
   ```
   IMAGEKIT_URL_ENDPOINT = https://ik.imagekit.io/ton_endpoint
   IMAGEKIT_PUBLIC_KEY = pk_ton_public_key
   IMAGEKIT_PRIVATE_KEY = private_ton_private_key
   ```

#### Option B : Via le fichier vercel.json
Remplace les valeurs dans `vercel.json` :
```json
{
  "env": {
    "IMAGEKIT_URL_ENDPOINT": "https://ik.imagekit.io/ton_endpoint",
    "IMAGEKIT_PUBLIC_KEY": "pk_ton_public_key",
    "IMAGEKIT_PRIVATE_KEY": "private_ton_private_key"
  }
}
```

### 4. Installer le SDK ImageKit (optionnel)
```bash
npm install imagekit
```

## 🔧 Configuration avancée

### Transformations d'images
ImageKit permet des transformations en temps réel via l'URL :
- `?tr=w-400,h-300` : Redimensionner à 400x300
- `?tr=f-jpg,q-80` : Convertir en JPEG avec qualité 80%
- `?tr=w-400,h-300,f-jpg,q-80` : Combiner les transformations

### Optimisations recommandées
```javascript
// URL optimisée pour la galerie
const optimizedUrl = `${imageUrl}?tr=w-400,h-300,f-jpg,q-80`;

// URL pour le lightbox (plus grande)
const lightboxUrl = `${imageUrl}?tr=w-800,h-600,f-jpg,q-90`;
```

## 📊 Plans et limites

### Plan Gratuit
- **1000 transformations/mois**
- **20GB de stockage**
- **CDN global**
- **API complète**

### Plan Pro ($20/mois)
- **50,000 transformations/mois**
- **100GB de stockage**
- **Support prioritaire**

## 🎯 Avantages pour ta galerie

1. **Chargement ultra-rapide** grâce au CDN
2. **Images optimisées** automatiquement
3. **Responsive** sur tous les appareils
4. **Pas de limite** sur le nombre de photos
5. **Transformations** en temps réel
6. **Sécurité** et contrôle d'accès

## 🚀 Déploiement

Une fois configuré :
1. Remplace les clés dans `vercel.json`
2. Redéploie : `vercel --prod`
3. Teste l'upload d'images

Tes images seront maintenant stockées et optimisées professionnellement ! 🎉 