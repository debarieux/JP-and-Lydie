const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de stockage persistant
const STORAGE_FILE = path.join(process.cwd(), 'photos-data.json');

// Fonction pour charger les photos depuis le fichier
const loadPhotos = () => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des photos:', error);
  }
  
  // Données par défaut si le fichier n'existe pas
  return [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
      title: "Notre premier rendez-vous",
      isFavorite: false
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      title: "Nos fiançailles",
      isFavorite: true
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
      title: "Préparation du mariage",
      isFavorite: false
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      title: "Le grand jour",
      isFavorite: false
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
      title: "Notre voyage de noces",
      isFavorite: false
    },
    {
      id: 6,
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      title: "Notre première maison",
      isFavorite: false
    }
  ];
};

// Fonction pour sauvegarder les photos dans le fichier
const savePhotos = (photos) => {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(photos, null, 2));
    console.log('Photos sauvegardées avec succès');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des photos:', error);
  }
};

// Charger les photos au démarrage
let photos = loadPhotos();

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
      console.log('GET /api/photos - Photos récupérées:', photos.length);
      res.status(200).json(photos);
      break;

    case 'POST':
      // Ajouter une nouvelle photo
      try {
        const newPhoto = {
          id: Date.now(), // ID unique basé sur le timestamp
          url: req.body.url,
          title: req.body.title || "Nouvelle photo",
          isFavorite: req.body.isFavorite || false
        };
        photos.push(newPhoto);
        savePhotos(photos); // Sauvegarder immédiatement
        console.log('POST /api/photos - Nouvelle photo ajoutée:', newPhoto);
        res.status(201).json(newPhoto);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la photo:', error);
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
        savePhotos(photos); // Sauvegarder immédiatement
        console.log('PUT /api/photos - Photo mise à jour:', photos[photoIndex]);
        res.status(200).json(photos[photoIndex]);
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
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
        savePhotos(photos); // Sauvegarder immédiatement
        console.log('DELETE /api/photos - Photo supprimée:', deletedPhoto);
        res.status(200).json(deletedPhoto);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(400).json({ error: "ID invalide" });
      }
      break;

    default:
      res.status(405).json({ error: "Méthode non autorisée" });
  }
}; 