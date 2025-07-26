# Frontend - Galerie Privée

Documentation technique détaillée de l'application React.

## 🏗️ Architecture

### Structure des Composants
```
App.tsx (Composant Principal)
├── Page d'Upload (currentView === 'upload')
├── Page de Connexion (currentView === 'login')
└── Galerie (currentView === 'gallery')
    └── PhotoCard.tsx (Composant Photo)
```

### Gestion d'État
- **useState** : État local des composants
- **LocalStorage** : Persistance de l'authentification
- **Props** : Communication entre composants

## 📁 Fichiers Principaux

### `App.tsx`
**Responsabilités :**
- Gestion de la navigation entre les vues
- Authentification et sécurité
- Upload et gestion des photos
- Notifications utilisateur

**Hooks utilisés :**
```typescript
const [currentView, setCurrentView] = useState<'upload' | 'login' | 'gallery'>('upload');
const [isAuthenticated, setIsAuthenticated] = useState(() => {
  const saved = localStorage.getItem('isAuthenticated');
  return saved === 'true';
});
const [photos, setPhotos] = useState<Photo[]>([]);
const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
```

### `PhotoCard.tsx`
**Responsabilités :**
- Affichage d'une photo individuelle
- Gestion des actions (zoom, téléchargement, suppression, favoris)
- État de survol pour les boutons d'action

**Props :**
```typescript
interface PhotoCardProps {
  photo: Photo;
  onZoom: (photo: Photo) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}
```

### `App.css`
**Organisation :**
- Reset CSS et styles de base
- Composants par page (upload, login, gallery)
- Responsive design avec media queries
- Animations et transitions

## 🔧 Fonctionnalités Techniques

### Authentification
```typescript
// Vérification du mot de passe
const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  if (password === correctPassword) {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setCurrentView('gallery');
  }
};
```

### Upload de Photos
```typescript
// Gestion de la sélection de fichiers
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  setUploadedFiles(prev => [...prev, ...imageFiles]);
};
```

### Gestion des Photos
```typescript
// Ajout de nouvelles photos
const handleUploadSubmit = async () => {
  const newPhotos: Photo[] = uploadedFiles.map((file, index) => ({
    id: Date.now() + index,
    url: URL.createObjectURL(file),
    title: `Photo ${photos.length + index + 1}`,
    isFavorite: false
  }));
  setPhotos(prev => [...prev, ...newPhotos]);
};
```

## 🎨 Système de Design

### Couleurs
```css
/* Palette principale */
--primary-color: #2c3e50;      /* Bleu foncé */
--secondary-color: #34495e;     /* Bleu gris */
--accent-color: #e74c3c;        /* Rouge */
--background: #f8f9fa;          /* Gris clair */
--text-color: #2c3e50;          /* Texte principal */
```

### Typographie
```css
/* Titres */
font-family: 'Parisienne', cursive;        /* Écriture manuscrite */
font-size: 3.5rem;

/* Texte */
font-family: 'Cormorant Garamond', serif;  /* Police classique */
font-size: 1rem;
```

### Espacement
```css
/* Système de spacing */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First */
@media (max-width: 480px) { /* Petits mobiles */ }
@media (max-width: 768px) { /* Tablettes */ }
@media (min-width: 769px) { /* Desktop */ }
```

### Adaptations Mobile
- **Grille** : 1 colonne sur mobile, auto-fill sur desktop
- **Boutons** : Taille adaptée pour le touch
- **Navigation** : Simplifiée sur mobile
- **Texte** : Tailles réduites pour la lisibilité

## 🔒 Sécurité

### Protection des Routes
```typescript
// Redirection automatique si non authentifié
useEffect(() => {
  if (currentView === 'gallery' && !isAuthenticated) {
    setCurrentView('upload');
  }
}, [currentView, isAuthenticated]);
```

### Validation des Fichiers
```typescript
// Vérification du type MIME
const imageFiles = files.filter(file => file.type.startsWith('image/'));
```

### Confirmation des Actions
```typescript
// Confirmation avant suppression
const handleDelete = (id: number) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
    setPhotos(photos.filter(photo => photo.id !== id));
  }
};
```

## ⚡ Performance

### Optimisations
- **Lazy Loading** : Images chargées à la demande
- **Memoization** : Composants optimisés avec React.memo
- **CSS Optimisé** : Classes sémantiques et réutilisables
- **Bundle Size** : Code minifié et tree-shaking

### Métriques
- **First Contentful Paint** : < 1.5s
- **Largest Contentful Paint** : < 2.5s
- **Cumulative Layout Shift** : < 0.1
- **First Input Delay** : < 100ms

## 🧪 Tests

### Tests Unitaires
```bash
# Installation des dépendances de test
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Exécution des tests
npm test
```

### Tests d'Intégration
- Navigation entre les pages
- Upload de photos
- Authentification
- Actions sur les photos

## 🚀 Build et Déploiement

### Scripts NPM
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### Variables d'Environnement
```env
# .env.local
REACT_APP_TITLE=Galerie Privée
REACT_APP_DEFAULT_PASSWORD=Jean-Philippe & Lydie
REACT_APP_API_URL=http://localhost:3001
```

### Build de Production
```bash
# Génération des fichiers optimisés
npm run build

# Contenu du dossier build/
build/
├── static/
│   ├── css/          # CSS minifié
│   ├── js/           # JavaScript minifié
│   └── media/        # Assets optimisés
├── index.html        # HTML principal
└── asset-manifest.json
```

## 🐛 Débogage

### Outils de Développement
- **React DevTools** : Inspection des composants
- **Redux DevTools** : Gestion de l'état (si applicable)
- **Chrome DevTools** : Performance et réseau

### Logs de Débogage
```typescript
// Activation des logs en développement
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### Erreurs Courantes
1. **Port déjà utilisé** : `PORT=3001 npm start`
2. **Dépendances manquantes** : `npm install`
3. **TypeScript errors** : Vérifier les types
4. **CSS non appliqué** : Vérifier les imports

## 📚 Ressources

### Documentation Officielle
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

### Outils Recommandés
- **VS Code** : Éditeur principal
- **ESLint** : Linting du code
- **Prettier** : Formatage automatique
- **Chrome DevTools** : Débogage

---

**Version** : 1.0.0  
**Dernière mise à jour** : 26/07/2025  
**Maintenu par** : [Votre nom]
