const fs = require('fs');
const path = require('path');

// Limites de stockage
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB en base64
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB total
const MAX_PHOTOS = 20; // Nombre maximum de photos

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

// Fonction pour vérifier la taille d'une image base64
const getBase64Size = (base64String) => {
  return Math.ceil((base64String.length * 3) / 4);
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

    // Vérifier la taille de l'image
    const imageSize = getBase64Size(imageData);
    console.log(`Taille de l'image: ${(imageSize / 1024).toFixed(2)}KB`);

    if (imageSize > MAX_IMAGE_SIZE) {
      return res.status(400).json({ 
        error: `Image trop volumineuse. Taille maximale: ${(MAX_IMAGE_SIZE / 1024).toFixed(0)}KB. Taille actuelle: ${(imageSize / 1024).toFixed(2)}KB` 
      });
    }

    // Créer un nom de fichier unique
    const uniqueFileName = generateUniqueFileName(fileName || 'photo.jpg');
    
    // Stocker l'image en base64 directement
    const response = {
      success: true,
      imageUrl: imageData, // Stockage direct en base64
      fileName: uniqueFileName,
      imageSize: imageSize,
      message: `Image uploadée avec succès (${(imageSize / 1024).toFixed(2)}KB)`
    };

    console.log('Upload d\'image base64:', response.message);
    res.status(200).json(response);

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
}; 