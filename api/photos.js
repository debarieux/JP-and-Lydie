const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de stockage persistant
const STORAGE_FILE = path.join(process.cwd(), 'photos-data.json');

// Fonction pour charger les photos depuis le fichier JSON
const loadPhotos = () => {
  try {
    const dataPath = path.join(process.cwd(), 'photos-data.json');
    
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      const photos = JSON.parse(data);
      
      // Nettoyer complètement les anciennes données
      console.log('🧹 Nettoyage des anciennes données...');
      const emptyPhotos = [];
      fs.writeFileSync(dataPath, JSON.stringify(emptyPhotos, null, 2));
      console.log('✅ Données nettoyées, galerie vide');
      return emptyPhotos;
    } else {
      console.log('📁 Fichier photos-data.json non trouvé, création d\'un nouveau');
      const emptyPhotos = [];
      fs.writeFileSync(dataPath, JSON.stringify(emptyPhotos, null, 2));
      return emptyPhotos;
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des photos:', error);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
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
  console.log('📥 API photos appelée:', req.method, req.url);
  
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('📤 Réponse OPTIONS');
    res.status(200).end();
    return;
  }

  const { method } = req;
  console.log('🔍 Méthode:', method);

  try {
    switch (method) {
      case 'GET':
        // Récupérer toutes les photos
        console.log('📸 GET /api/photos - Photos récupérées:', photos.length);
        console.log('📊 Photos:', photos);
        res.status(200).json(photos);
        break;

      case 'POST':
        // Ajouter une nouvelle photo
        try {
          console.log('📝 POST /api/photos - Données reçues:', req.body);
          const newPhoto = {
            id: Date.now(), // ID unique basé sur le timestamp
            url: req.body.url,
            title: req.body.title || "Nouvelle photo",
            isFavorite: req.body.isFavorite || false
          };
          photos.push(newPhoto);
          savePhotos(photos); // Sauvegarder immédiatement
          console.log('✅ POST /api/photos - Nouvelle photo ajoutée:', newPhoto);
          res.status(201).json(newPhoto);
        } catch (error) {
          console.error('❌ Erreur lors de l\'ajout de la photo:', error);
          res.status(400).json({ error: "Données invalides" });
        }
        break;

      case 'PUT':
        // Mettre à jour une photo (favoris, etc.)
        try {
          const { id } = req.query;
          console.log('🔄 PUT /api/photos - ID:', id, 'Données:', req.body);
          const photoIndex = photos.findIndex(p => p.id == id);
          
          if (photoIndex === -1) {
            console.error('❌ Photo non trouvée pour ID:', id);
            return res.status(404).json({ error: "Photo non trouvée" });
          }

          photos[photoIndex] = { ...photos[photoIndex], ...req.body };
          savePhotos(photos); // Sauvegarder immédiatement
          console.log('✅ PUT /api/photos - Photo mise à jour:', photos[photoIndex]);
          res.status(200).json(photos[photoIndex]);
        } catch (error) {
          console.error('❌ Erreur lors de la mise à jour:', error);
          res.status(400).json({ error: "Données invalides" });
        }
        break;

      case 'DELETE':
        // Supprimer une photo
        try {
          const { id } = req.query;
          console.log('🗑️ DELETE /api/photos - ID:', id);
          const photoIndex = photos.findIndex(p => p.id == id);
          
          if (photoIndex === -1) {
            console.error('❌ Photo non trouvée pour ID:', id);
            return res.status(404).json({ error: "Photo non trouvée" });
          }

          const deletedPhoto = photos.splice(photoIndex, 1)[0];
          savePhotos(photos); // Sauvegarder immédiatement
          console.log('✅ DELETE /api/photos - Photo supprimée:', deletedPhoto);
          res.status(200).json(deletedPhoto);
        } catch (error) {
          console.error('❌ Erreur lors de la suppression:', error);
          res.status(400).json({ error: "ID invalide" });
        }
        break;

      default:
        console.error('❌ Méthode non autorisée:', method);
        res.status(405).json({ error: "Méthode non autorisée" });
    }
  } catch (error) {
    console.error('❌ Erreur générale dans l\'API photos:', error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
}; 