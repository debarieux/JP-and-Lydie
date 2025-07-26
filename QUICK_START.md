# 🚀 Démarrage Rapide - Galerie Privée

Guide ultra-rapide pour démarrer l'application en 30 secondes !

## ⚡ Démarrage Express

### Windows
```bash
# Double-cliquez sur start.bat
# OU dans le terminal :
start.bat
```

### Linux/Mac
```bash
# Rendez le script exécutable
chmod +x start.sh

# Lancez l'application
./start.sh
```

### Manuel
```bash
cd frontend
npm install  # Première fois seulement
npm start
```

## 🌐 Accès

- **URL** : http://localhost:3000
- **Code d'accès** : `Jean-Philippe & Lydie`

## 📱 Test Rapide

1. **Ouvrez** http://localhost:3000
2. **Cliquez** sur "Connection" (haut à droite)
3. **Entrez** le code : `Jean-Philippe & Lydie`
4. **Explorez** la galerie !

## 🔧 En Cas de Problème

### Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Dépendances manquantes
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Erreur TypeScript
```bash
cd frontend
npm run build
```

## 📋 Checklist de Démarrage

- [ ] Node.js installé (version 16+)
- [ ] npm installé
- [ ] Dépendances installées (`npm install`)
- [ ] Port 3000 libre
- [ ] Navigateur ouvert

## 🎯 Fonctionnalités à Tester

- [ ] **Page d'accueil** : Upload de photos
- [ ] **Authentification** : Connexion avec le code
- [ ] **Galerie** : Visualisation des photos
- [ ] **Actions** : Zoom, téléchargement, suppression, favoris
- [ ] **Responsive** : Test sur mobile
- [ ] **Changement de mot de passe** : Fonctionnalité admin

## 🚨 Urgences

### L'application ne démarre pas
```bash
# Nettoyage complet
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm start
```

### Erreur de compilation
```bash
# Vérifiez la version de Node.js
node --version  # Doit être >= 16

# Réinstallez les dépendances
npm install
```

### Problème de port
```bash
# Utilisez un autre port
PORT=3001 npm start
```

---

**💡 Conseil** : Gardez ce guide ouvert pendant les premiers tests !

**🎉 Félicitations** : Votre galerie privée est maintenant opérationnelle ! 