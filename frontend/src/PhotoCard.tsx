import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => {
        console.log("Réponse de l'API /api/hello :", data);
      })
      .catch((err) => {
        console.error("Erreur lors de l'appel à l'API /api/hello :", err);
      });
  }, []);

  // Ajouter un timestamp pour éviter le cache
  const imageUrl = `${photo.url}?t=${Date.now()}`;
  
  return (
    <div
      className={`photo-card${hovered ? ' photo-card-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="photo-card-img-wrapper" onClick={() => onZoom(photo)}>
        <img
          src={imageUrl}
          alt={photo.title}
          className="photo-card-img"
          onError={(e) => {
            console.error(`❌ Erreur chargement image: ${photo.url}`);
            console.error(`📱 Détails:`, {
              photoId: photo.id,
              photoTitle: photo.title,
              photoUrl: photo.url,
              imageUrl: imageUrl
            });
            // Fallback vers une image par défaut
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMS4wNDYgMTIwIDEyMCAxMTEuMDQ2IDEyMCAxMDBDMTIwIDg4Ljk1NCAxMTEuMDQ2IDgwIDEwMCA4MEM4OC45NTQgODAgODAgODguOTU0IDgwIDEwMEM4MCAxMTEuMDQ2IDg4Ljk1NCAxMjAgMTAwIDEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzBDMTE1LjQ2NCAxMzAgMTI3LjUgMTE3Ljk2NCAxMjcuNSAxMDIuNUMxMjcuNSA4Ny4wMzYgMTE1LjQ2NCA3NSAxMDAgNzVDODQuNTM2IDc1IDcyLjUgODcuMDM2IDcyLjUgMTAyLjVDNzIuNSAxMTcuOTY0IDg0LjUzNiAxMzAgMTAwIDEzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
          }}
        />
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