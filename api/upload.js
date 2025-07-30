const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');
const formidable = require('formidable');

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
    // Utiliser le répertoire temporaire de Vercel
    const tempDir = '/tmp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: tempDir,
      keepExtensions: true,
      maxFileSize: MAX_IMAGE_SIZE,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Erreur parsing:', err);
        return res.status(500).json({ error: 'Erreur lors du traitement du fichier' });
      }

      try {
        const file = files.file;
        if (!file) {
          console.error('❌ Aucun fichier reçu');
          return res.status(400).json({ error: 'Aucun fichier reçu' });
        }

        console.log(`📦 Fichier reçu: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        if (file.size > MAX_IMAGE_SIZE) {
          console.error(`❌ Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          return res.status(400).json({ 
            error: `Fichier trop volumineux. Taille maximale: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB. Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
          });
        }

        // Lire le fichier temporaire
        const fileData = fs.readFileSync(file.path);
        console.log('📁 Fichier temporaire lu:', file.path);
        
        // Upload vers ImageKit
        console.log('🚀 Début upload vers ImageKit...');
        const uploadResponse = await imagekit.upload({
          file: fileData,
          fileName: file.name,
          folder: "/galerie-privee",
          useUniqueFileName: true,
          tags: ["galerie", "upload"],
        });

        console.log('✅ Upload ImageKit réussi:', uploadResponse);
        console.log('🔗 URL retournée:', uploadResponse.url);

        // Supprimer le fichier temporaire
        fs.unlinkSync(file.path);
        console.log('🗑️ Fichier temporaire supprimé');

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

      } catch (error) {
        console.error('❌ Erreur upload ImageKit:', error);
        res.status(500).json({ error: `Erreur lors de l'upload: ${error.message}` });
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    res.status(500).json({ error: "Erreur lors de l'upload de l'image" });
  }
}; 