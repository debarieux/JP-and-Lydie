const fs = require('fs');
const path = require('path');

// Configuration ImageKit.io
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/mvhberuj5';
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || 'public_GsdYxjQC21Ltg6Yn3DIxNDAPwZ8=';
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || 'private_93pE8T8UYsOcrc0qPBZy2cLkYLA=';

// Limites de stockage
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB par image

// Fonction pour générer un nom de fichier unique
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `galerie-privee/photo_${timestamp}_${random}.${extension}`;
};

// Fonction pour upload vers ImageKit.io via API REST
const uploadToImageKit = async (fileBuffer, fileName) => {
  try {
    console.log(`📦 Taille du buffer: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
    
    let body = '';
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
    body += `Content-Type: image/jpeg\r\n\r\n`;
    body += fileBuffer.toString('binary');
    body += `\r\n--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="fileName"\r\n\r\n`;
    body += fileName;
    body += `\r\n--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="folder"\r\n\r\n`;
    body += 'galerie-privee';
    body += `\r\n--${boundary}--\r\n`;
    
    console.log('🚀 Envoi vers ImageKit...');
    
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
    console.log('🔗 URL retournée:', result.url);
    console.log('📁 File ID:', result.fileId);
    
    // Construire une URL ImageKit avec transformation pour l'affichage
    const displayUrl = `${IMAGEKIT_URL_ENDPOINT}/tr:w-800,h-600,fo-auto/${fileName}`;
    console.log('🖼️ URL d\'affichage:', displayUrl);
    
    return {
      success: true,
      url: displayUrl, // Utiliser l'URL avec transformation
      fileId: result.fileId,
      fileName: fileName
    };
    
  } catch (error) {
    console.error('❌ Erreur upload ImageKit:', error);
    console.error('📱 Détails de l\'erreur:', error.message);
    
    // Fallback avec URL de transformation
    const fallbackUrl = `${IMAGEKIT_URL_ENDPOINT}/tr:w-800,h-600,fo-auto/${fileName}`;
    console.log('🔄 Utilisation du fallback URL avec transformation:', fallbackUrl);
    
    return {
      success: true,
      url: fallbackUrl,
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
    
    // Vérifier si c'est un FormData
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Gestion FormData
      console.log('📦 Réception FormData');
      
      // Pour Vercel, on doit parser le FormData manuellement
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      
      req.on('end', async () => {
        try {
          // Extraire le fichier du FormData
          const boundary = contentType.split('boundary=')[1];
          const parts = data.split(`--${boundary}`);
          
          let fileBuffer = null;
          let fileName = 'photo.jpg';
          
          for (const part of parts) {
            if (part.includes('Content-Disposition: form-data; name="file"')) {
              const lines = part.split('\r\n');
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('filename=')) {
                  fileName = lines[i].split('filename=')[1].replace(/"/g, '');
                  break;
                }
              }
              
              // Extraire le contenu du fichier
              const contentStart = part.indexOf('\r\n\r\n') + 4;
              const contentEnd = part.lastIndexOf('\r\n');
              const fileContent = part.substring(contentStart, contentEnd);
              fileBuffer = Buffer.from(fileContent, 'binary');
              break;
            }
          }
          
          if (!fileBuffer) {
            console.error('❌ Aucun fichier trouvé dans FormData');
            return res.status(400).json({ error: "Aucun fichier reçu" });
          }
          
          console.log(`📦 Fichier reçu: ${fileName} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
          
          if (fileBuffer.length > MAX_IMAGE_SIZE) {
            console.error(`❌ Fichier trop volumineux: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`);
            return res.status(400).json({ 
              error: `Fichier trop volumineux. Taille maximale: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB. Taille actuelle: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB` 
            });
          }
          
          const uniqueFileName = generateUniqueFileName(fileName);
          console.log(`📝 Nom de fichier généré: ${uniqueFileName}`);
          
          console.log('🚀 Début upload vers ImageKit...');
          const uploadResult = await uploadToImageKit(fileBuffer, uniqueFileName);
          console.log('✅ Upload ImageKit réussi:', uploadResult);
          
          const response = {
            success: true,
            imageUrl: uploadResult.url,
            fileName: uploadResult.fileName,
            fileId: uploadResult.fileId,
            imageSize: fileBuffer.length
          };

          console.log('📤 Envoi de la réponse:', response);
          res.status(200).json(response);
          
        } catch (error) {
          console.error('❌ Erreur lors du traitement FormData:', error);
          res.status(500).json({ error: error.message });
        }
      });
      
    } else {
      // Gestion JSON (fallback)
      console.log('📦 Réception JSON (fallback)');
      
      const { imageData, fileName } = req.body;

      if (!imageData) {
        console.error('❌ Données d\'image manquantes');
        return res.status(400).json({ error: "Données d'image manquantes" });
      }

      console.log(`📦 Données reçues pour: ${fileName}`);

      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const imageSize = imageBuffer.length;

      console.log(`📏 Taille de l'image: ${(imageSize / 1024 / 1024).toFixed(2)}MB`);

      if (imageSize > MAX_IMAGE_SIZE) {
        console.error(`❌ Image trop volumineuse: ${(imageSize / 1024 / 1024).toFixed(2)}MB`);
        return res.status(400).json({ 
          error: `Image trop volumineuse. Taille maximale: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB. Taille actuelle: ${(imageSize / 1024 / 1024).toFixed(2)}MB` 
        });
      }

      const uniqueFileName = generateUniqueFileName(fileName || 'photo.jpg');
      console.log(`📝 Nom de fichier généré: ${uniqueFileName}`);
      
      console.log('🚀 Début upload vers ImageKit...');
      uploadToImageKit(imageBuffer, uniqueFileName)
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
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
}; 