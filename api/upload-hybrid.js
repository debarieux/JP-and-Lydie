const fs = require('fs');
const formidable = require('formidable');
const { put } = require('@vercel/blob');

// Limites de stockage
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB par image

module.exports = async (req, res) => {
  console.log('📥 API upload hybride appelée - Méthode:', req.method);
  
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
    console.log('🔄 Début du traitement de l\'upload hybride...');
    
    // Utiliser le répertoire temporaire de Vercel
    const tempDir = '/tmp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('📁 Répertoire temporaire créé:', tempDir);
    }

    const form = formidable({
      uploadDir: tempDir,
      keepExtensions: true,
      maxFileSize: MAX_IMAGE_SIZE,
      multiples: false,
    });

    // Utiliser une Promise pour gérer formidable
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error('❌ Erreur parsing formidable:', err);
            reject(err);
          } else {
            console.log('✅ Parsing formidable réussi');
            resolve({ fields, files });
          }
        });
      });
    };

    const { fields, files } = await parseForm();
    
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

    // Vérifier que le fichier existe
    if (!fs.existsSync(file.path)) {
      console.error('❌ Fichier temporaire introuvable:', file.path);
      return res.status(500).json({ error: 'Fichier temporaire introuvable' });
    }

    // Lire le fichier temporaire
    console.log('📁 Lecture du fichier temporaire:', file.path);
    const fileData = fs.readFileSync(file.path);
    console.log('✅ Fichier temporaire lu, taille:', fileData.length, 'bytes');
    
    // Essayer d'abord avec Vercel Blob
    console.log('🚀 Tentative d\'upload vers Vercel Blob...');
    
    try {
      // Créer un nom de fichier unique
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}-${randomSuffix}-${file.name}`;
      
      console.log('📝 Nom de fichier généré:', fileName);
      
      const blob = await put(fileName, fileData, {
        access: 'public',
        addRandomSuffix: false, // On gère nous-mêmes le suffixe
      });

      console.log('✅ Upload Vercel Blob réussi:', {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size
      });

      // Supprimer le fichier temporaire
      try {
        fs.unlinkSync(file.path);
        console.log('🗑️ Fichier temporaire supprimé');
      } catch (unlinkError) {
        console.warn('⚠️ Erreur lors de la suppression du fichier temporaire:', unlinkError.message);
      }

      // Retourner l'URL de l'image uploadée
      const response = {
        success: true,
        imageUrl: blob.url,
        fileName: blob.pathname,
        fileId: blob.pathname,
        imageSize: file.size,
        downloadUrl: blob.downloadUrl,
        method: 'vercel-blob'
      };

      console.log('📤 Envoi de la réponse:', response);
      res.status(200).json(response);

    } catch (blobError) {
      console.error('❌ Erreur upload Vercel Blob:', {
        message: blobError.message,
        stack: blobError.stack,
        name: blobError.name
      });
      
      // Fallback : retourner une URL de placeholder
      console.log('🔄 Utilisation du mode fallback...');
      
      // Supprimer le fichier temporaire
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log('🗑️ Fichier temporaire supprimé après erreur');
        }
      } catch (unlinkError) {
        console.warn('⚠️ Erreur lors de la suppression du fichier temporaire:', unlinkError.message);
      }
      
      // Retourner une réponse avec une URL de placeholder
      const fallbackResponse = {
        success: true,
        imageUrl: 'https://via.placeholder.com/400x300/cccccc/666666?text=Image+Non+Disponible',
        fileName: file.name,
        fileId: `fallback-${Date.now()}`,
        imageSize: file.size,
        downloadUrl: 'https://via.placeholder.com/400x300/cccccc/666666?text=Image+Non+Disponible',
        method: 'fallback',
        warning: 'Vercel Blob non disponible, utilisation du mode fallback'
      };

      console.log('📤 Envoi de la réponse fallback:', fallbackResponse);
      res.status(200).json(fallbackResponse);
    }

  } catch (error) {
    console.error('❌ Erreur générale lors de l\'upload hybride:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: "Erreur lors de l'upload de l'image (mode hybride)",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 