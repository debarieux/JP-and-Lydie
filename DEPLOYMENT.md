# Guide de Déploiement - Galerie Privée

Guide complet pour déployer l'application sur différents hébergeurs.

## 🚀 Déploiement Rapide

### 1. Préparation
```bash
# Build de production
cd frontend
npm run build

# Vérification des fichiers
ls build/
```

### 2. Options de Déploiement

## 📦 Netlify (Recommandé)

### Déploiement Automatique
1. **Connectez votre repo GitHub** à Netlify
2. **Configuration** :
   - Build command : `cd frontend && npm install && npm run build`
   - Publish directory : `frontend/build`
   - Node version : `16` ou supérieur

### Déploiement Manuel
```bash
# Installation de Netlify CLI
npm install -g netlify-cli

# Build
cd frontend && npm run build

# Déploiement
netlify deploy --prod --dir=build
```

## ☁️ Vercel

### Déploiement Automatique
1. **Importez votre projet** sur Vercel
2. **Configuration** :
   - Framework Preset : `Create React App`
   - Root Directory : `frontend`
   - Build Command : `npm run build`
   - Output Directory : `build`

### Déploiement Manuel
```bash
# Installation de Vercel CLI
npm install -g vercel

# Déploiement
cd frontend
vercel --prod
```

## 🐙 GitHub Pages

### Configuration
1. **Ajoutez dans `package.json`** :
```json
{
  "homepage": "https://username.github.io/repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

2. **Installation et déploiement** :
```bash
npm install --save-dev gh-pages
npm run deploy
```

## 🔥 Firebase Hosting

### Configuration
1. **Installation Firebase CLI** :
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

2. **Configuration Firebase** :
```json
{
  "hosting": {
    "public": "frontend/build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

3. **Déploiement** :
```bash
firebase deploy
```

## 🌐 Surge.sh

### Déploiement Simple
```bash
# Installation
npm install -g surge

# Build et déploiement
cd frontend && npm run build
surge build
```

## 🐳 Docker

### Dockerfile
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build et Déploiement Docker
```bash
# Build de l'image
docker build -t galerie-privee .

# Exécution
docker run -p 80:80 galerie-privee
```

## 🔧 Configuration Avancée

### Variables d'Environnement
Créez un fichier `.env.production` :
```env
REACT_APP_TITLE=Galerie Privée
REACT_APP_DEFAULT_PASSWORD=Jean-Philippe & Lydie
REACT_APP_API_URL=https://your-api.com
```

### Optimisations de Performance
```bash
# Analyse du bundle
npm install -g webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

### Compression Gzip
```bash
# Installation
npm install -g compression-webpack-plugin

# Configuration webpack
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: 'gzip'
    })
  ]
};
```

## 🔒 Sécurité

### Headers de Sécurité
Ajoutez dans votre serveur web :
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
```

### HTTPS
- **Netlify/Vercel** : HTTPS automatique
- **Firebase** : HTTPS par défaut
- **GitHub Pages** : HTTPS disponible
- **Surge** : HTTPS automatique

## 📊 Monitoring

### Google Analytics
Ajoutez dans `public/index.html` :
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry (Gestion d'erreurs)
```bash
npm install @sentry/react @sentry/tracing
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

## 🚨 Dépannage

### Erreurs Courantes

**Build échoue**
```bash
# Nettoyage et réinstallation
rm -rf node_modules package-lock.json
npm install
npm run build
```

**404 sur les routes**
- Configurez le fallback vers `index.html`
- Vérifiez la configuration du serveur web

**Images ne se chargent pas**
- Vérifiez les chemins relatifs
- Assurez-vous que les images sont dans `public/`

**Performance lente**
- Activez la compression Gzip
- Optimisez les images
- Utilisez un CDN

## 📈 Métriques de Performance

### Lighthouse
```bash
# Installation
npm install -g lighthouse

# Test
lighthouse https://your-site.com --output html --output-path ./lighthouse-report.html
```

### WebPageTest
- Testez sur https://www.webpagetest.org/
- Analysez les métriques Core Web Vitals

## 🔄 Mise à Jour

### Déploiement Continu
1. **GitHub Actions** pour automatisation
2. **Webhooks** pour déploiement automatique
3. **Environnements** de staging et production

### Rollback
- Gardez des sauvegardes des versions précédentes
- Utilisez les fonctionnalités de rollback de votre hébergeur

---

**Conseil** : Commencez par Netlify ou Vercel pour un déploiement simple et rapide ! 