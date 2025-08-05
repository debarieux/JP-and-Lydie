const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');
const Busboy = require('busboy');

// Configuration ImageKit.io
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mvhberuj5';
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || 'public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=';
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || 'private_93pE8T8UYsOcrc0qPBZy2cLkYLA=';

// Initialiser ImageKit
const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

// Limites de stockage
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB par image

// Fonction pour parser le multipart/form-data avec busboy
const parseMultipartFormData = (req) => {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};
    
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1
      }
    });
    
    busboy.on('field', (name, value) => {
      fields[name] = value;
    });
    
    busboy.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];
      
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        files[name] = {
          name: filename,
          type: mimeType,
          size: buffer.length,
          data: buffer
        };
      });
    });
    
    busboy.on('finish', () => {
      resolve({ fields, files });
    });
    
    busboy.on('error', (error) => {
      reject(error);
    });
    
    req.pipe(busboy);
  });
};

module.exports = async (req, res) => {
  console.log('📥 API upload appelée - Méthode:', req.method);
  console.log('🔧 Configuration ImageKit:', {
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    publicKey: IMAGEKIT_PUBLIC_KEY ? '✅ Configuré' : '❌ Manquant',
    privateKey: IMAGEKIT_PRIVATE_KEY ? '✅ Configuré' : '❌ Manquant'
  });
  
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('📤 Réponse OPTIONS envoyée');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('❌ Méthode non autorisée:', req.method);
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    console.log('🔄 Début du traitement de l\'upload...');

    // Parser le multipart/form-data avec busboy
    const { fields, files } = await parseMultipartFormData(req);
    
    console.log('📋 Champs reçus:', Object.keys(fields));
    console.log('📁 Fichiers reçus:', Object.keys(files));

    const file = files.file;
    if (!file) {
      console.error('❌ Aucun fichier reçu dans la requête');
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    console.log(`📦 Fichier reçu: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    if (file.size > MAX_IMAGE_SIZE) {
      console.error(`❌ Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return res.status(400).json({ 
        error: `Fichier trop volumineux. Taille maximale: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB. Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      });
    }

    // Upload vers ImageKit directement avec les données du buffer
    console.log('🚀 Début upload vers ImageKit...');
    try {
      const uploadResponse = await imagekit.upload({
        file: file.data,
        fileName: file.name,
        folder: "/galerie-privee",
        useUniqueFileName: true,
        tags: ["galerie", "upload"],
      });

      console.log('✅ Upload ImageKit réussi:', {
        url: uploadResponse.url,
        name: uploadResponse.name,
        fileId: uploadResponse.fileId
      });

      // Retourner l'URL de l'image uploadée
      const response = {
        success: true,
        imageUrl: uploadResponse.url,
        fileName: uploadResponse.name,
        fileId: uploadResponse.fileId,
        imageSize: file.size
      };

      console.log('📤 Envoi de la réponse:', response);
      res.status(200).json(response);

    } catch (imagekitError) {
      console.error('❌ Erreur upload ImageKit:', {
        message: imagekitError.message,
        stack: imagekitError.stack,
        name: imagekitError.name
      });
      
      res.status(500).json({ 
        error: `Erreur lors de l'upload vers ImageKit: ${imagekitError.message}`,
        details: process.env.NODE_ENV === 'development' ? imagekitError.stack : undefined
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale lors de l\'upload:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: "Erreur lors de l'upload de l'image",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 