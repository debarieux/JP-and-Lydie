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

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [zoomPhoto, setZoomPhoto] = useState<Photo | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour charger les photos depuis l'API
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      console.log('🔄 Chargement des photos depuis l\'API...');
      
      const response = await fetch('/api/photos');
      console.log('📡 Réponse API photos:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const photosData = await response.json();
      console.log('📸 Photos reçues:', photosData);
      console.log('📊 Nombre de photos:', photosData.length);
      
      // Vérifier chaque photo
      photosData.forEach((photo: Photo, index: number) => {
        console.log(`📷 Photo ${index + 1}:`, {
          id: photo.id,
          url: photo.url,
          title: photo.title,
          isFavorite: photo.isFavorite
        });
      });
      
      setPhotos(photosData);
      console.log('✅ Photos chargées avec succès dans l\'état');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des photos:', error);
      showNotification('Erreur lors du chargement des photos', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Charger les photos depuis l'API au montage
  useEffect(() => {
    fetchPhotos();
  }, []);

  // Rafraîchissement intelligent : seulement quand nécessaire
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && currentView === 'gallery') {
        // Rafraîchir seulement si on n'a pas fait d'action récemment
        const lastActionTime = localStorage.getItem('lastActionTime');
        const now = Date.now();
        const timeSinceLastAction = lastActionTime ? now - parseInt(lastActionTime) : 60000; // 1 minute par défaut
        
        if (timeSinceLastAction > 30000) { // Rafraîchir seulement si plus de 30s depuis la dernière action
          console.log('🔄 Rafraîchissement automatique intelligent...');
          fetchPhotos();
        } else {
          console.log('⏸️ Rafraîchissement ignoré (action récente)');
        }
      }
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isAuthenticated, currentView]);

  // Rafraîchissement immédiat après changement de vue
  useEffect(() => {
    if (isAuthenticated && currentView === 'gallery') {
      console.log('🔄 Rafraîchissement après changement de vue...');
      fetchPhotos();
    }
  }, [currentView, isAuthenticated]);

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

  // Fonction pour marquer une action récente
  const markAction = () => {
    localStorage.setItem('lastActionTime', Date.now().toString());
    console.log('📝 Action marquée - rafraîchissement différé');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      try {
        console.log('🗑️ Suppression de la photo:', id);
        const response = await fetch(`/api/photos?id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          console.log('✅ Photo supprimée avec succès');
          markAction(); // Marquer l'action
          // Rafraîchissement immédiat
          await fetchPhotos();
          showNotification('Photo supprimée avec succès', 'success');
          
          // Rafraîchissement supplémentaire après 2 secondes
          setTimeout(async () => {
            console.log('🔄 Vérification post-suppression...');
            await fetchPhotos();
          }, 2000);
        } else {
          console.error('❌ Erreur lors de la suppression:', response.status);
          showNotification('Erreur lors de la suppression', 'error');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  const handleToggleFavorite = async (id: number) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) {
      console.error('❌ Photo non trouvée pour l\'ID:', id);
      return;
    }

    try {
      console.log('⭐ Changement favori pour la photo:', id);
      console.log('📸 Photo actuelle:', photo);
      console.log('🔄 Nouvel état favori:', !photo.isFavorite);
      
      const response = await fetch(`/api/photos?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isFavorite: !photo.isFavorite
        })
      });

      console.log('📡 Réponse API:', response.status, response.statusText);

      if (response.ok) {
        const updatedPhoto = await response.json();
        console.log('✅ Photo mise à jour:', updatedPhoto);
        
        markAction(); // Marquer l'action
        // Rafraîchissement immédiat
        await fetchPhotos();
        showNotification(
          photo.isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris', 
          'success'
        );
        
        // Rafraîchissement supplémentaire après 2 secondes
        setTimeout(async () => {
          console.log('🔄 Vérification post-favori...');
          await fetchPhotos();
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur lors de la mise à jour:', response.status, errorText);
        showNotification('Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      showNotification('Erreur lors de la mise à jour', 'error');
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
    
    try {
      console.log('🚀 Début de l\'upload de', uploadedFiles.length, 'photos en parallèle');
      
      // Traiter toutes les images en parallèle pour accélérer l'upload
      const uploadPromises = uploadedFiles.map(async (file, index) => {
        console.log(`📤 Préparation upload photo ${index + 1}/${uploadedFiles.length}:`, file.name);
        
        // Compresser l'image
        const compressedImageData = await compressImage(file);
        console.log(`📦 Image compressée: ${file.name} -> ${(compressedImageData.length / 1024).toFixed(2)}KB`);
        
        // Upload de l'image via l'API d'upload
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageData: compressedImageData,
            fileName: file.name
          })
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Erreur lors de l'upload de l'image: ${uploadResponse.status}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log(`✅ Upload réussi pour ${file.name}:`, uploadResult);
        
        // Créer la photo dans la galerie avec l'URL de l'image uploadée
        const newPhoto = {
          url: uploadResult.imageUrl,
          title: `Photo uploadée ${Date.now() + index}`,
          isFavorite: false
        };

        console.log(`📝 Envoi de la photo à l'API photos:`, newPhoto);

        const response = await fetch('/api/photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newPhoto)
        });

        console.log(`📡 Réponse API photos pour ${file.name}:`, response.status);
        
        if (response.ok) {
          const createdPhoto = await response.json();
          console.log(`✅ Photo créée avec succès:`, createdPhoto);
          return createdPhoto;
        } else {
          const errorText = await response.text();
          console.error(`❌ Erreur API photos pour ${file.name}:`, errorText);
          throw new Error(`Erreur lors de l'ajout de la photo: ${response.status}`);
        }
      });
      
      // Attendre que tous les uploads soient terminés
      const results = await Promise.all(uploadPromises);
      console.log(`🎉 Toutes les ${results.length} photos uploadées avec succès !`);
      
      // Recharger la galerie une seule fois après tous les uploads
      await fetchPhotos();
      console.log('✅ Galerie rechargée avec succès');
      
      markAction(); // Marquer l'action d'upload
      
      // Nettoyer les fichiers uploadés
      setUploadedFiles([]);
      
      showNotification(`${results.length} photo(s) uploadée(s) avec succès !`, 'success');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
      showNotification('Erreur lors de l\'upload des photos', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour compresser une image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Réduire la taille maximale à 600px pour accélérer l'upload
        const maxSize = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image compressée
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Réduire la qualité à 0.6 pour un fichier plus petit
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
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
                        onError={(e) => {
                          // Fallback si l'image ne charge pas
                          e.currentTarget.src = "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop";
                        }}
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
          <div className="gallery-header-actions">
            {isRefreshing && (
              <div className="refresh-indicator">
                <div className="refresh-spinner"></div>
                <span>Actualisation...</span>
              </div>
            )}
          <button onClick={handleLogout} className="logout-button">
            Se déconnecter
          </button>
          </div>
        </header>

        <main className="gallery-main">
          {(() => {
            console.log('État loading:', loading, 'Nombre de photos:', photos.length);
            return null;
          })()}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement de la galerie...</p>
            </div>
          ) : (
          <div className="gallery-grid">
              {(() => {
                console.log('Affichage de', photos.length, 'photos:', photos);
                return null;
              })()}
              {photos.length === 0 ? (
                <div className="empty-gallery">
                  <p>Aucune photo dans la galerie</p>
                </div>
              ) : (
                photos.map(photo => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onZoom={handleZoom}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
                ))
              )}
          </div>
          )}
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
