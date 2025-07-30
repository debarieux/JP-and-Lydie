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
          {photo.isFavorite ? '❤️' : '🤍'}
        </button>
        <button
          onClick={() => onDelete(photo.id)}
          className="delete-button"
          title="Supprimer la photo"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default PhotoCard; 