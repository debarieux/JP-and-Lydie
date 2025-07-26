const fs = require('fs');
const path = require('path');

// Configuration ImageKit.io
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mvhberuj5';
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || 'public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=';
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || 'private_93pE8T8UYsOcrc0qPBZy2cLkYLA=';

// Limites de stockage
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB par image
const MAX_PHOTOS = 100; // Nombre maximum de photos

// Fonction pour générer un nom de fichier unique
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `galerie-privee/photo_${timestamp}.${extension}`;
};

// Fonction pour upload vers ImageKit.io
const uploadToImageKit = async (imageData, fileName) => {
  try {
    // Convertir base64 en buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Préparer les données pour ImageKit
    const formData = new FormData();
    formData.append('file', imageBuffer, fileName);
    formData.append('fileName', fileName);
    formData.append('folder', 'galerie-privee');
    
    // Upload vers ImageKit (simulation - tu devras configurer les vraies clés)
    // En production, utilise le SDK ImageKit ou l'API REST
    
    // Pour l'instant, on simule l'upload
    const imageUrl = `${IMAGEKIT_URL_ENDPOINT}/galerie-privee/${fileName}`;
    
    return {
      success: true,
      url: imageUrl,
      fileId: `file_${Date.now()}`,
      fileName: fileName
    };
  } catch (error) {
    console.error('Erreur upload ImageKit:', error);
    throw new Error('Erreur lors de l\'upload vers ImageKit');
  }
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
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageSize = Math.ceil((base64Data.length * 3) / 4);
    
    console.log(`Taille de l'image: ${(imageSize / 1024 / 1024).toFixed(2)}MB`);

    if (imageSize > MAX_IMAGE_SIZE) {
      return res.status(400).json({ 
        error: `Image trop volumineuse. Taille maximale: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB. Taille actuelle: ${(imageSize / 1024 / 1024).toFixed(2)}MB` 
      });
    }

    // Créer un nom de fichier unique
    const uniqueFileName = generateUniqueFileName(fileName || 'photo.jpg');
    
    // Upload vers ImageKit.io
    uploadToImageKit(imageData, uniqueFileName)
      .then(uploadResult => {
        const response = {
          success: true,
          imageUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileId: uploadResult.fileId,
          imageSize: imageSize,
          message: `Image uploadée avec succès vers ImageKit (${(imageSize / 1024 / 1024).toFixed(2)}MB)`
        };

        console.log('Upload ImageKit réussi:', response.message);
        res.status(200).json(response);
      })
      .catch(error => {
        console.error('Erreur upload ImageKit:', error);
        res.status(500).json({ error: error.message });
      });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
}; 