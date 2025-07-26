# 🚀 Déploiement Vercel - Galerie Privée

Guide complet pour déployer automatiquement sur Vercel.

## ⚡ Déploiement Automatique

### 1. Connexion à Vercel
1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"New Project"**

### 2. Import du Repository
1. Sélectionnez le repository `debarieux/JP-and-Lydie`
2. Vercel détectera automatiquement que c'est un projet React

### 3. Configuration Automatique
Vercel utilisera automatiquement :
- **Framework Preset** : Create React App
- **Root Directory** : `frontend`
- **Build Command** : `npm run build`
- **Output Directory** : `build`
- **Install Command** : `npm install`

### 4. Variables d'Environnement
Ajoutez ces variables dans Vercel :
```
REACT_APP_TITLE=Galerie Privée - Jean-Philippe & Lydie
REACT_APP_DEFAULT_PASSWORD=Jean-Philippe & Lydie
```

### 5. Déploiement
Cliquez sur **"Deploy"** - Vercel déploiera automatiquement !

## 🔄 Déploiement Automatique

Une fois configuré :
- **Chaque push** sur la branche `main` déclenche un nouveau déploiement
- **Pull requests** créent des previews automatiques
- **Rollback** instantané en cas de problème

## 📊 Monitoring

### Performance
- **Core Web Vitals** : Mesurés automatiquement
- **Lighthouse** : Scores disponibles
- **Analytics** : Intégrés par défaut

### Logs
- **Build logs** : Accessibles dans l'interface Vercel
- **Runtime logs** : Pour le débogage
- **Error tracking** : Intégré

## 🔧 Configuration Avancée

### Domaine Personnalisé
1. Allez dans **Settings > Domains**
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions

### Headers de Sécurité
Ajoutez dans `vercel.json` :
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 🚨 Dépannage

### Build Échoue
1. Vérifiez les logs de build dans Vercel
2. Testez localement : `cd frontend && npm run build`
3. Vérifiez les dépendances dans `package.json`

### Erreurs de Runtime
1. Vérifiez les logs de fonction dans Vercel
2. Testez localement : `npm start`
3. Vérifiez les variables d'environnement

### Problèmes de Performance
1. Optimisez les images
2. Vérifiez la taille du bundle
3. Activez la compression Gzip

## 📈 Optimisations

### Cache
Vercel met en cache automatiquement :
- **Assets statiques** : CSS, JS, images
- **Pages** : Mise en cache intelligente
- **API routes** : Si ajoutées plus tard

### CDN
- **Global CDN** : Distribution mondiale
- **Edge locations** : Performance optimale
- **Automatic scaling** : Gestion de la charge

## 🎯 URLs de Déploiement

Après déploiement, vous aurez :
- **URL de production** : `https://jp-and-lydie.vercel.app`
- **URL de preview** : Pour chaque PR
- **URL de développement** : Pour les tests

## 🔒 Sécurité

### HTTPS
- **Automatique** : HTTPS par défaut
- **HSTS** : Headers de sécurité
- **Certificats** : Gérés automatiquement

### Variables d'Environnement
- **Chiffrées** : Stockage sécurisé
- **Par environnement** : Dev/Prod séparés
- **Access control** : Permissions granulaires

---

## ✅ Checklist de Déploiement

- [ ] Repository connecté à Vercel
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] Site accessible
- [ ] HTTPS activé
- [ ] Domaine personnalisé (optionnel)
- [ ] Monitoring configuré

---

**🎉 Votre galerie privée sera automatiquement déployée à chaque mise à jour !**