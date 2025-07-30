const fs = require('fs');
const path = require('path');

// Limites de stockage
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB par image

// Fonction pour générer un nom de fichier unique
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `photo_${timestamp}_${random}.${extension}`;
};

module.exports = (req, res) => {
  console.log('📥 API upload appelée');
  
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
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Gestion FormData
      console.log('📦 Réception FormData');
      
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      });
      
      req.on('end', async () => {
        try {
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
          
          // Créer le dossier uploads s'il n'existe pas
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('📁 Dossier uploads créé:', uploadDir);
          }
          
          // Sauvegarder le fichier localement
          const filePath = path.join(uploadDir, uniqueFileName);
          fs.writeFileSync(filePath, fileBuffer);
          console.log('💾 Fichier sauvegardé:', filePath);
          
          // Construire l'URL publique
          const publicUrl = `/uploads/${uniqueFileName}`;
          console.log('🔗 URL publique:', publicUrl);
          
          const response = {
            success: true,
            imageUrl: publicUrl,
            fileName: uniqueFileName,
            fileId: `file_${Date.now()}`,
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
      
      // Créer le dossier uploads s'il n'existe pas
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('📁 Dossier uploads créé:', uploadDir);
      }
      
      // Sauvegarder le fichier localement
      const filePath = path.join(uploadDir, uniqueFileName);
      fs.writeFileSync(filePath, imageBuffer);
      console.log('💾 Fichier sauvegardé:', filePath);
      
      // Construire l'URL publique
      const publicUrl = `/uploads/${uniqueFileName}`;
      console.log('🔗 URL publique:', publicUrl);
      
      const response = {
        success: true,
        imageUrl: publicUrl,
        fileName: uniqueFileName,
        fileId: `file_${Date.now()}`,
        imageSize: imageSize
      };

      console.log('📤 Envoi de la réponse:', response);
      res.status(200).json(response);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
}; 