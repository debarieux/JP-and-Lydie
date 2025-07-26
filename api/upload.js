const fs = require('fs');
const path = require('path');

// Fonction pour convertir une image en base64
const convertImageToBase64 = (imageBuffer) => {
  return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
};

// Fonction pour générer un nom de fichier unique
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `photo_${timestamp}.${extension}`;
};

module.exports = (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    // Récupérer les données de l'image (base64)
    const { imageData, fileName } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: "Données d'image manquantes" });
    }

    // Créer un nom de fichier unique
    const uniqueFileName = generateUniqueFileName(fileName || 'photo.jpg');
    
    // Pour l'instant, on va utiliser des images d'exemple mais avec des noms uniques
    // En production, il faudrait uploader vers un service comme Cloudinary, AWS S3, etc.
    const sampleImages = [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop"
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];

    // Retourner l'URL de l'image
    const response = {
      success: true,
      imageUrl: randomImage,
      fileName: uniqueFileName,
      message: "Image uploadée avec succès (simulation)"
    };

    console.log('Upload d\'image:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
}; 