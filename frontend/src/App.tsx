import React, { useState, useEffect, useRef } from 'react';
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
  const [loading, setLoading] = useState(false); // Initialiser à false

  const [zoomPhoto, setZoomPhoto] = useState<Photo | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction pour charger les photos depuis l'API
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      console.log('🔄 Chargement des photos depuis l\'API...');
      
      // Timeout pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout lors du chargement des photos')), 10000);
      });
      
      const fetchPromise = fetch('/api/photos');
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      console.log('📡 Réponse API photos:', response.status);
      
      if (response.ok) {
        const photosData = await response.json();
        console.log('📸 Photos reçues:', photosData);
        console.log('📊 Nombre de photos:', photosData.length);
        
        // Utiliser directement les URLs ImageKit sans cache-busting
        photosData.forEach((photo: Photo, index: number) => {
          console.log(`📷 Photo ${index + 1}:`, photo);
          console.log(`🔗 URL ImageKit: ${photo.url}`);
        });
        
        console.log('📸 Photos prêtes pour affichage:', photosData);
        setPhotos(photosData);
        console.log('✅ Photos chargées avec succès dans l\'état');
      } else {
        console.error('❌ Erreur lors du chargement des photos:', response.status);
        showNotification('Erreur lors du chargement de la galerie', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des photos:', error);
      showNotification('Erreur lors du chargement de la galerie', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Charger les photos depuis l'API au montage
  useEffect(() => {
    if (isAuthenticated && currentView === 'gallery') {
      fetchPhotos();
    } else {
      // Si pas authentifié, s'assurer que loading est false
      setLoading(false);
    }
  }, [isAuthenticated, currentView]);

  // Rafraîchissement intelligent : seulement quand nécessaire
  useEffect(() => {
    if (!isAuthenticated || currentView !== 'gallery') return;
    
    const interval = setInterval(() => {
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
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isAuthenticated, currentView]);

  // Redirection basée sur l'authentification
  useEffect(() => {
    if (isAuthenticated) {
      // Si authentifié, aller à la galerie
      setCurrentView('gallery');
    } else {
      // Si pas authentifié, aller à l'upload
      setCurrentView('upload');
    }
  }, [isAuthenticated]);

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

  // Fonction pour marquer une action (rafraîchissement intelligent)
  const markAction = () => {
    localStorage.setItem('lastActionTime', Date.now().toString());
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
    
    // Accepter tous les fichiers d'image, peu importe la taille
    setUploadedFiles(prev => [...prev, ...imageFiles]);
    
    // Vider l'input file pour permettre de sélectionner les mêmes fichiers à nouveau
    event.target.value = '';
  };

  // Gestion du drag & drop
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      showNotification('Seules les images sont acceptées', 'error');
    }
    
    if (imageFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...imageFiles]);
      showNotification(`${imageFiles.length} photo(s) ajoutée(s) par glisser-déposer`, 'success');
      
      // Vider l'input file pour s'assurer qu'il soit réinitialisé
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleUploadSubmit = async () => {
    if (uploadedFiles.length === 0) {
      showNotification('Veuillez sélectionner au moins une photo', 'error');
      return;
    }

    setIsUploading(true);
    console.log('🔄 Début du processus d\'upload...');
    console.log(`📱 Appareil: ${navigator.userAgent}`);
    
    // Détection appareil mobile réel
    const isRealMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSamsung = navigator.userAgent.includes('Samsung') || navigator.userAgent.includes('SM-');
    
    console.log(`📱 Appareil mobile réel: ${isRealMobile}`);
    console.log(`📱 Appareil tactile: ${isTouchDevice}`);
    console.log(`📱 Samsung: ${isSamsung}`);
    
    try {
      console.log('🚀 Début de l\'upload de', uploadedFiles.length, 'photos');
      
      // Traiter les images une par une
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        console.log(`📤 Upload photo ${i + 1}/${uploadedFiles.length}:`, file.name, `(${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        
        try {
          // Utiliser directement le fichier sans compression pour l'instant
          const processedFile = file;
          console.log(`📦 Fichier préparé: ${processedFile.name} -> ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
          
          // Préparation des données avec FormData
          const formData = new FormData();
          formData.append('file', processedFile);
          
          console.log(`📤 Envoi de ${processedFile.name} vers l'API upload...`);
          
          // Timeout de 15 secondes pour éviter les blocages
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          // Upload de l'image via l'API d'upload
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log(`📡 Réponse API upload pour ${processedFile.name}:`, uploadResponse.status, uploadResponse.statusText);
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`❌ Erreur API upload pour ${processedFile.name}:`, errorText);
            throw new Error(`Erreur lors de l'upload de l'image: ${uploadResponse.status} - ${errorText}`);
          }
          
          const uploadResult = await uploadResponse.json();
          console.log(`✅ Upload réussi pour ${processedFile.name}:`, uploadResult);
          console.log(`🔗 URL reçue: ${uploadResult.imageUrl}`);
          
          // Créer la photo dans la galerie avec l'URL de l'image uploadée
          const newPhoto = {
            url: uploadResult.imageUrl,
            title: `Photo uploadée ${Date.now() + i}`,
            isFavorite: false
          };

          console.log(`📝 Envoi de la photo à l'API photos:`, newPhoto);
          console.log(`🖼️ URL qui sera affichée: ${newPhoto.url}`);
          console.log(`🔍 Vérification URL: ${newPhoto.url}`);
          
          // Test de l'URL pour voir si elle est accessible
          try {
            const testResponse = await fetch(newPhoto.url, { method: 'HEAD' });
            console.log(`🔍 Test URL ${newPhoto.url}: ${testResponse.status} ${testResponse.statusText}`);
          } catch (error) {
            console.error(`❌ URL non accessible: ${newPhoto.url}`, error);
          }

          const response = await fetch('/api/photos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPhoto)
          });

          console.log(`📡 Réponse API photos pour ${processedFile.name}:`, response.status, response.statusText);
          
          if (response.ok) {
            const createdPhoto = await response.json();
            console.log(`✅ Photo créée avec succès:`, createdPhoto);
            console.log(`🆔 ID de la photo créée: ${createdPhoto.id}`);
            console.log(`🔗 URL finale: ${createdPhoto.url}`);
          } else {
            const errorText = await response.text();
            console.error(`❌ Erreur API photos pour ${processedFile.name}:`, errorText);
            throw new Error(`Erreur lors de l'ajout de la photo: ${response.status} - ${errorText}`);
          }
          
        } catch (error) {
          console.error(`❌ Erreur pour ${file.name}:`, error);
          
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('L\'upload a pris trop de temps. Essayez avec une image plus petite.');
          } else {
            throw error;
          }
        }
      }
      
      console.log(`🎉 Toutes les ${uploadedFiles.length} photos uploadées avec succès !`);
      
      // Recharger la galerie après tous les uploads
      console.log('🔄 Rechargement de la galerie...');
      await fetchPhotos();
      console.log('✅ Galerie rechargée avec succès');
      
      markAction(); // Marquer l'action d'upload
      
      // Nettoyer les fichiers uploadés
      setUploadedFiles([]);
      
      // Vider l'input file pour s'assurer qu'il soit réinitialisé
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      showNotification(`${uploadedFiles.length} photo(s) uploadée(s) avec succès !`, 'success');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showNotification(`Erreur lors de l'upload des photos: ${errorMessage}`, 'error');
    } finally {
      console.log('🏁 Fin du processus d\'upload');
      setIsUploading(false);
    }
  };

  // Fonction pour supprimer un fichier de la liste d'upload
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
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
            >
              <input 
                ref={fileInputRef}
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
                  <button 
                    onClick={() => setCurrentView('upload')} 
                    className="add-photos-button"
                  >
                    Ajouter des photos
                  </button>
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
