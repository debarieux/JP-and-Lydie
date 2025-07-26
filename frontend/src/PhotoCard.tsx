import React, { useState } from 'react';
import './App.css';
import { Photo } from './types';

interface PhotoCardProps {
  photo: Photo;
  onZoom: (photo: Photo) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onZoom, onDelete, onToggleFavorite }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`photo-card${hovered ? ' photo-card-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="photo-card-img-wrapper" onClick={() => onZoom(photo)}>
        <img src={photo.url} alt={photo.title} className="photo-card-img" />
        <div className={`photo-card-actions-overlay${hovered ? ' visible' : ''}`} onClick={e => e.stopPropagation()}>
          <button
            className="photo-card-action"
            title="Zoomer"
            onClick={() => onZoom(photo)}
            aria-label="Zoom"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          <a
            className="photo-card-action"
            title="Télécharger"
            href={photo.url}
            download
            aria-label="Télécharger"
            onClick={e => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
          <button
            className="photo-card-action delete"
            title="Supprimer"
            onClick={() => onDelete(photo.id)}
            aria-label="Supprimer"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,6 5,6 21,6"/>
              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
            </svg>
          </button>
          <button
            className={`photo-card-fav${photo.isFavorite ? ' active' : ''}`}
            title={photo.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onClick={() => onToggleFavorite(photo.id)}
            aria-label="Favori"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={photo.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="photo-card-content">
        <div className="photo-card-title-row">
          <h3 className="photo-card-title">{photo.title}</h3>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard; 