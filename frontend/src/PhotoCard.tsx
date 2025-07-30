import React from 'react';
import { Photo } from './types';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onZoom: (photo: Photo) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onDelete, onToggleFavorite, onZoom }) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('❌ Erreur chargement image:', photo.url);
    console.log('📱 Détails:', {
      photoId: photo.id,
      photoTitle: photo.title,
      photoUrl: photo.url,
      imageUrl: event.currentTarget.src
    });
    
    // Afficher une image par défaut en cas d'erreur
    event.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iI0M3Q0RDNyIvPgo8L3N2Zz4K';
  };

  return (
    <div className="photo-card">
      <div className="photo-image-container" onClick={() => onZoom(photo)}>
        <img
          src={photo.url}
          alt={photo.title}
          className="photo-image"
          onError={handleImageError}
          loading="lazy"
        />
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