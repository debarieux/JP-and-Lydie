// Stockage temporaire en mémoire (en production, utilisez une vraie base de données)
let photos = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    alt: "Paysage montagneux",
    favorite: false
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
    alt: "Forêt verdoyante",
    favorite: true
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    alt: "Lac de montagne",
    favorite: false
  }
];

module.exports = (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      // Récupérer toutes les photos
      res.status(200).json(photos);
      break;

    case 'POST':
      // Ajouter une nouvelle photo
      try {
        const newPhoto = {
          id: Date.now(), // ID unique basé sur le timestamp
          src: req.body.src,
          alt: req.body.alt || "Nouvelle photo",
          favorite: req.body.favorite || false
        };
        photos.push(newPhoto);
        res.status(201).json(newPhoto);
      } catch (error) {
        res.status(400).json({ error: "Données invalides" });
      }
      break;

    case 'PUT':
      // Mettre à jour une photo (favoris, etc.)
      try {
        const { id } = req.query;
        const photoIndex = photos.findIndex(p => p.id == id);
        
        if (photoIndex === -1) {
          return res.status(404).json({ error: "Photo non trouvée" });
        }

        photos[photoIndex] = { ...photos[photoIndex], ...req.body };
        res.status(200).json(photos[photoIndex]);
      } catch (error) {
        res.status(400).json({ error: "Données invalides" });
      }
      break;

    case 'DELETE':
      // Supprimer une photo
      try {
        const { id } = req.query;
        const photoIndex = photos.findIndex(p => p.id == id);
        
        if (photoIndex === -1) {
          return res.status(404).json({ error: "Photo non trouvée" });
        }

        const deletedPhoto = photos.splice(photoIndex, 1)[0];
        res.status(200).json(deletedPhoto);
      } catch (error) {
        res.status(400).json({ error: "ID invalide" });
      }
      break;

    default:
      res.status(405).json({ error: "Méthode non autorisée" });
  }
}; 