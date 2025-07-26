import React, { useState, useEffect } from 'react';
import './App.css';
import PhotoCard from './PhotoCard';
import { Photo } from './types';

function App() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState<'upload' | 'login' | 'gallery'>('upload');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });

  const correctPassword = 'Jean-Philippe & Lydie';

  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      title: 'Notre premier rendez-vous',
      isFavorite: false
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
      title: 'Nos fiançailles',
      isFavorite: false
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
      title: 'Préparation du mariage',
      isFavorite: false
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
      title: 'Le grand jour',
      isFavorite: false
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      title: 'Notre voyage de noces',
      isFavorite: false
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400',
      title: 'Notre première maison',
      isFavorite: false
    }
  ]);

  const [zoomPhoto, setZoomPhoto] = useState<Photo | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Redirection basée sur l'authentification
  useEffect(() => {
    if (currentView === 'gallery' && !isAuthenticated) {
      setCurrentView('upload');
    }
  }, [currentView, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentView === 'upload') {
      setCurrentView('gallery');
    }
  }, [isAuthenticated, currentView]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      setCurrentView('gallery');
      setError('');
    } else {
      setError('Code d\'accès incorrect. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setCurrentView('upload');
    setPassword('');
    setError('');
  };

  const goToLogin = () => {
    setCurrentView('login');
    setPassword('');
    setError('');
  };

  const goToUpload = () => {
    setCurrentView('upload');
    setPassword('');
    setError('');
  };

  const handleZoom = (photo: Photo) => setZoomPhoto(photo);
  const handleCloseZoom = () => setZoomPhoto(null);

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      setPhotos(photos.filter(photo => photo.id !== id));
      showNotification('Photo supprimée avec succès', 'success');
    }
  };

  const handleToggleFavorite = (id: number) => {
    setPhotos(photos.map(photo => 
      photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
    ));
    const photo = photos.find(p => p.id === id);
    if (photo) {
      showNotification(
        photo.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris', 
        'success'
      );
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentPassword !== correctPassword) {
      showNotification('Mot de passe actuel incorrect', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showNotification('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }
    if (newPassword === currentPassword) {
      showNotification('Le nouveau mot de passe doit être différent de l\'actuel', 'error');
      return;
    }
    
    showNotification('Mot de passe modifié avec succès', 'success');
    setShowPasswordChange(false);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      showNotification('Seules les images sont acceptées', 'error');
    }
    
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  };

  const handleUploadSubmit = async () => {
    if (uploadedFiles.length === 0) {
      showNotification('Veuillez sélectionner au moins une photo', 'error');
      return;
    }

    setIsUploading(true);
    
    // Simulation d'upload
    setTimeout(() => {
      const newPhotos: Photo[] = uploadedFiles.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        title: `Photo ${photos.length + index + 1}`,
        isFavorite: false
      }));
      
      setPhotos(prev => [...prev, ...newPhotos]);
      setUploadedFiles([]);
      setIsUploading(false);
      showNotification('Photos ajoutées avec succès !', 'success');
    }, 1000);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Page d'upload
  if (currentView === 'upload') {
    return (
      <div className="upload-page">
        <header className="main-header">
          <div className="main-header-content">
            <button onClick={goToLogin} className="main-connection-button">
              Connection
            </button>
          </div>
        </header>

        <main className="main-content">
          <div className="names-section">
            <div className="names-container">
              <h1 className="upload-title">Jean-Philippe</h1>
              <h1 className="upload-title">&</h1>
              <h1 className="upload-title">Lydie</h1>
            </div>
            <div className="separator"></div>
            <div className="thank-you-message">
              <p>Merci de partager votre tendresse et vos souvenirs précieux avec nous !</p>
            </div>
          </div>

          <div className="upload-section-container">
            <div className="upload-area">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-label">
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div className="upload-placeholder">
                  Cliquez ou déposez vos photos ici
                </div>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="uploaded-files">
                <h3 className="uploaded-files-title">Photos sélectionnées</h3>
                <div className="uploaded-files-grid">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="uploaded-file-item">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="uploaded-file-preview"
                      />
                      <div className="uploaded-file-name">{file.name}</div>
                      <button
                        onClick={() => removeUploadedFile(index)}
                        className="remove-file-button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="upload-actions">
                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                    className="upload-submit-button"
                  >
                    {isUploading ? 'Ajout en cours...' : 'Ajouter à la galerie'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Page de connexion
  if (currentView === 'login') {
    return (
      <div className="login-page">
        <div className="login-container">
          <button onClick={goToUpload} className="close-button">
            ×
          </button>
          
          {!showPasswordChange ? (
            <>
              <h1 className="login-title">Galerie Privée</h1>
              <p className="login-subtitle">Code d'accès des mariés</p>
              
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Code d'accès
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
                
                <button type="submit" className="login-button">
                  Accéder à la galerie
                </button>
              </form>
              
              <div className="password-change-section">
                <button 
                  onClick={() => setShowPasswordChange(true)}
                  className="password-change-button"
                >
                  Modifier le mot de passe
                </button>
                <p className="password-change-hint">
                  Seuls les mariés peuvent modifier le mot de passe
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="password-change-title">Modifier le mot de passe</div>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
                
                <div className="password-change-actions">
                  <button type="submit" className="login-button">
                    Modifier
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="cancel-button"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Galerie (seulement si authentifié)
  if (currentView === 'gallery' && isAuthenticated) {
    return (
      <div className="gallery-page">
        <header className="gallery-header">
          <h1 className="gallery-title">Notre Galerie Privée</h1>
          <button onClick={handleLogout} className="logout-button">
            Se déconnecter
          </button>
        </header>

        <main className="gallery-main">
          <div className="gallery-grid">
            {photos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onZoom={handleZoom}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </main>

        {zoomPhoto && (
          <div className="lightbox" onClick={handleCloseZoom}>
            <img src={zoomPhoto.url} alt={zoomPhoto.title} className="lightbox-img" />
            <button onClick={handleCloseZoom} className="lightbox-close">
              ×
            </button>
          </div>
        )}

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    );
  }

  // Fallback - retour à la page d'upload
  return (
    <div className="upload-page">
      <header className="main-header">
        <div className="main-header-content">
          <button onClick={goToLogin} className="main-connection-button">
            Connection
          </button>
        </div>
      </header>
      <main className="main-content">
        <div className="names-section">
          <div className="names-container">
            <h1 className="upload-title">Jean-Philippe</h1>
            <h1 className="upload-title">&</h1>
            <h1 className="upload-title">Lydie</h1>
          </div>
          <div className="separator"></div>
          <div className="thank-you-message">
            <p>Merci de partager votre tendresse et vos souvenirs précieux avec nous !</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
