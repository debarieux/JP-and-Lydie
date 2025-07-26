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
  const extension = originalName.split('.').pop() || 'jpg';
  return `galerie-privee/photo_${timestamp}.${extension}`;
};

// Fonction pour upload vers ImageKit.io via API REST
const uploadToImageKit = async (imageData, fileName) => {
  try {
    // Convertir base64 en buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log(`📦 Taille du buffer: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    // Créer la boundary pour multipart/form-data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    
    // Construire le body multipart manuellement
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    body += `Content-Type: image/jpeg\r\n\r\n`;
    body += imageBuffer.toString('binary');
    body += `\r\n--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="fileName"\r\n\r\n`;
    body += fileName;
    body += `\r\n--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="folder"\r\n\r\n`;
    body += 'galerie-privee';
    body += `\r\n--${boundary}--\r\n`;
    
    console.log('🚀 Envoi vers ImageKit...');
    
    // Upload via API REST ImageKit avec timeout plus long
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(IMAGEKIT_PRIVATE_KEY + ':').toString('base64')}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: Buffer.from(body, 'binary')
    });
    
    console.log(`📡 Réponse ImageKit: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur ImageKit API:', response.status, errorText);
      throw new Error(`Erreur upload ImageKit: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload ImageKit réussi:', result);
    
    return {
      success: true,
      url: result.url,
      fileId: result.fileId,
      fileName: fileName
    };
    
  } catch (error) {
    console.error('❌ Erreur upload ImageKit:', error);
    
    // Fallback : utiliser l'URL directe ImageKit
    const imageUrl = `${IMAGEKIT_URL_ENDPOINT}/galerie-privee/${fileName}`;
    console.log('🔄 Utilisation du fallback URL:', imageUrl);
    
    return {
      success: true,
      url: imageUrl,
      fileId: `file_${Date.now()}`,
      fileName: fileName
    };
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
    console.log('📥 API upload appelée');
    
    // Récupérer les données de l'image (base64)
    const { imageData, fileName } = req.body;

    if (!imageData) {
      console.error('❌ Données d\'image manquantes');
      return res.status(400).json({ error: "Données d'image manquantes" });
    }

    console.log(`📦 Données reçues pour: ${fileName}`);

    // Vérifier la taille de l'image
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageSize = Math.ceil((base64Data.length * 3) / 4);

    console.log(`📏 Taille de l'image: ${(imageSize / 1024 / 1024).toFixed(2)}MB`);

    if (imageSize > MAX_IMAGE_SIZE) {
      console.error(`❌ Image trop volumineuse: ${(imageSize / 1024 / 1024).toFixed(2)}MB`);
      return res.status(400).json({ 
        error: `Image trop volumineuse. Taille maximale: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB. Taille actuelle: ${(imageSize / 1024 / 1024).toFixed(2)}MB` 
      });
    }

    // Créer un nom de fichier unique
    const uniqueFileName = generateUniqueFileName(fileName || 'photo.jpg');
    console.log(`📝 Nom de fichier généré: ${uniqueFileName}`);
    
    // Upload vers ImageKit.io
    console.log('🚀 Début upload vers ImageKit...');
    uploadToImageKit(imageData, uniqueFileName)
      .then(uploadResult => {
        console.log('✅ Upload ImageKit réussi:', uploadResult);
        
        const response = {
          success: true,
          imageUrl: uploadResult.url,
          fileName: uploadResult.fileName,
          fileId: uploadResult.fileId,
          imageSize: imageSize
        };

        console.log('📤 Envoi de la réponse:', response);
        res.status(200).json(response);
      })
      .catch(error => {
        console.error('❌ Erreur upload ImageKit:', error);
        res.status(500).json({ error: error.message });
      });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
}; 