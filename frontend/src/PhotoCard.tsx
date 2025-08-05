import React, { useState } from 'react';
import { Photo } from './types';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onZoom: (photo: Photo) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onDelete, onToggleFavorite, onZoom }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ Erreur chargement image:', photo.url);
    console.log('📱 Détails:', {
      photoId: photo.id,
      photoTitle: photo.title,
      photoUrl: photo.url,
      imageUrl: event.currentTarget.src
    });
    
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleRetry = () => {
    setImageError(false);
    setImageLoading(true);
  };

  const handleDownload = async (event: React.MouseEvent) => {
    // Empêcher la propagation de l'événement pour éviter le zoom
    event.stopPropagation();
    
    try {
      // Télécharger l'image en utilisant fetch pour obtenir le blob
      const response = await fetch(photo.url);
      const blob = await response.blob();
      
      // Créer un lien temporaire pour télécharger l'image
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extraire le nom du fichier de l'URL ou utiliser le titre de la photo
      const urlParts = photo.url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0] || `${photo.title}.jpg`;
      
      link.download = fileName;
      
      // Ajouter le lien au DOM, cliquer dessus, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL créée
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Téléchargement initié pour:', fileName);
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
    }
  };

  return (
    <div className="photo-card">
      <div className="photo-image-container" onClick={() => onZoom(photo)}>
        {imageError ? (
          <div className="photo-error">
            <p>🖼️ Image non disponible</p>
            <button onClick={handleRetry} className="retry-button">
              🔄 Réessayer
            </button>
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="photo-loading">
                <p>⏳ Chargement...</p>
              </div>
            )}
            <img 
              src={photo.url} 
              alt={photo.title} 
              className={`photo-image ${imageLoading ? 'loading' : ''}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          </>
        )}
      </div>
      <div className="photo-actions">
        <button
          onClick={() => onToggleFavorite(photo.id)}
          className={`favorite-button ${photo.isFavorite ? 'favorited' : ''}`}
          title={photo.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            {photo.isFavorite ? (
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            ) : (
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
            )}
          </svg>
        </button>
        <button 
          onClick={handleDownload}
          className="download-button"
          title="Télécharger la photo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        <button 
          onClick={() => onDelete(photo.id)}
          className="delete-button"
          title="Supprimer la photo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PhotoCard; 