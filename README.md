# Galerie Privée - Jean-Philippe & Lydie

Une application web élégante et professionnelle pour partager des photos de mariage de manière privée et sécurisée.

## 🌟 Fonctionnalités

### 🔐 Authentification Sécurisée
- **Code d'accès privé** : Seuls les invités avec le code peuvent accéder à la galerie
- **Persistance de session** : Connexion maintenue entre les sessions
- **Changement de mot de passe** : Fonctionnalité sécurisée pour les mariés

### 📸 Upload de Photos
- **Multi-sélection** : Sélection de plusieurs photos simultanément
- **Prévisualisation** : Aperçu des photos avant upload
- **Suppression individuelle** : Retrait de photos non désirées
- **Validation** : Seules les images sont acceptées

### 🖼️ Galerie Privée
- **Affichage élégant** : Design professionnel et responsive
- **Actions sur photos** :
  - 🔍 **Zoom** : Visualisation en plein écran
  - 💾 **Téléchargement** : Sauvegarde locale
  - ❌ **Suppression** : Retrait définitif avec confirmation
  - ❤️ **Favoris** : Marquage des photos préférées
- **Interface mobile-first** : Optimisé pour tous les écrans

### 🎨 Design Professionnel
- **Identité visuelle** : Couleurs neutres et élégantes
- **Typographie** : Polices "Parisienne" et "Cormorant Garamond"
- **Animations** : Transitions fluides et modernes
- **Responsive** : Adaptation parfaite mobile/desktop

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd JP_Lydie

# Installer les dépendances
cd frontend
npm install

# Démarrer l'application
npm start
```

### Accès
- **URL locale** : http://localhost:3000
- **Code d'accès par défaut** : "Jean-Philippe & Lydie"

## 📁 Structure du Projet

```
JP_Lydie/
├── frontend/                 # Application React
│   ├── public/              # Fichiers statiques
│   ├── src/
│   │   ├── App.tsx         # Composant principal
│   │   ├── App.css         # Styles CSS
│   │   ├── PhotoCard.tsx   # Composant photo
│   │   └── index.tsx       # Point d'entrée
│   ├── package.json        # Dépendances
│   └── README.md           # Documentation frontend
├── backend/                # API Backend (optionnel)
└── README.md              # Documentation principale
```

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** : Framework JavaScript
- **TypeScript** : Typage statique
- **CSS3** : Styles personnalisés
- **Google Fonts** : Typographie élégante

### Fonctionnalités
- **LocalStorage** : Persistance des données
- **File API** : Gestion des uploads
- **Responsive Design** : Mobile-first
- **Progressive Web App** : Installation possible

## 🔧 Configuration

### Personnalisation des Couleurs
Modifiez les variables CSS dans `frontend/src/App.css` :
```css
/* Couleurs principales */
--primary-color: #2c3e50;
--secondary-color: #34495e;
--accent-color: #e74c3c;
```

### Changement du Mot de Passe
1. Accédez à la page de connexion
2. Cliquez sur "Modifier le mot de passe"
3. Entrez l'ancien mot de passe
4. Saisissez le nouveau mot de passe (min. 6 caractères)

### Ajout de Photos
1. Sur la page d'accueil, cliquez sur la zone d'upload
2. Sélectionnez vos photos (formats : JPG, PNG, GIF)
3. Vérifiez les aperçus
4. Cliquez sur "Ajouter à la galerie"

## 📱 Utilisation

### Pour les Invités
1. **Accès** : Utilisez le code fourni par les mariés
2. **Upload** : Partagez vos photos via la zone d'upload
3. **Visualisation** : Consultez la galerie privée
4. **Actions** : Zoom, téléchargement, favoris

### Pour les Mariés
1. **Administration** : Accès complet à toutes les fonctionnalités
2. **Modération** : Suppression de photos si nécessaire
3. **Sécurité** : Changement du code d'accès
4. **Gestion** : Organisation des favoris

## 🔒 Sécurité

### Authentification
- Code d'accès unique et sécurisé
- Session persistante via LocalStorage
- Protection contre l'accès non autorisé

### Données
- Photos stockées localement (pas de serveur)
- Aucune donnée personnelle collectée
- Respect de la vie privée

### Validation
- Vérification des types de fichiers
- Limitation aux formats image
- Confirmation pour les actions critiques

## 🎯 Fonctionnalités Avancées

### Système de Favoris
- Marquage des photos préférées
- Persistance des choix
- Animation de cœur

### Lightbox
- Visualisation en plein écran
- Navigation intuitive
- Fermeture par clic ou touche Échap

### Notifications
- Feedback utilisateur en temps réel
- Messages de succès/erreur
- Disparition automatique

## 📊 Performance

### Optimisations
- Images optimisées pour le web
- Chargement lazy des composants
- CSS minifié et optimisé
- Code TypeScript compilé

### Compatibilité
- **Navigateurs** : Chrome, Firefox, Safari, Edge
- **Mobiles** : iOS Safari, Chrome Mobile
- **Résolutions** : 320px à 4K

## 🚀 Déploiement

### Build de Production
```bash
cd frontend
npm run build
```

### Hébergement Recommandé
- **Netlify** : Déploiement gratuit et simple
- **Vercel** : Performance optimale
- **GitHub Pages** : Intégration Git
- **Firebase Hosting** : Solution Google

### Variables d'Environnement
```env
REACT_APP_TITLE=Galerie Privée
REACT_APP_DEFAULT_PASSWORD=Jean-Philippe & Lydie
```

## 🐛 Dépannage

### Problèmes Courants

**L'application ne démarre pas**
```bash
# Vérifiez Node.js
node --version

# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

**Erreur de port**
```bash
# Changez le port
PORT=3001 npm start
```

**Photos qui ne s'affichent pas**
- Vérifiez le format (JPG, PNG, GIF)
- Taille maximale recommandée : 10MB
- Connexion internet stable

### Logs de Débogage
Activez les logs détaillés dans la console du navigateur pour diagnostiquer les problèmes.

## 🤝 Contribution

### Développement
1. Fork du projet
2. Création d'une branche feature
3. Commit des changements
4. Pull Request

### Standards de Code
- **TypeScript** : Typage strict
- **ESLint** : Linting automatique
- **Prettier** : Formatage du code
- **Tests** : Couverture minimale 80%

## 📄 Licence

Ce projet est privé et destiné à un usage personnel pour le mariage de Jean-Philippe et Lydie.

## 📞 Support

Pour toute question ou problème :
- **Email** : [contact@example.com]
- **Issues** : [GitHub Issues]
- **Documentation** : Ce README

---

**Développé avec ❤️ pour Jean-Philippe & Lydie** 