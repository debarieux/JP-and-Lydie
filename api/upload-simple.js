const fs = require('fs');
const formidable = require('formidable');

// Limites de stockage
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB par image

module.exports = async (req, res) => {
  console.log('📥 API upload simple appelée - Méthode:', req.method);
  
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
    console.log('🔄 Début du traitement de l\'upload simple...');
    
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
    
    // Pour le test, on va juste retourner les informations du fichier
    // sans faire d'upload vers Vercel Blob
    console.log('🧪 Test mode - Pas d\'upload vers Vercel Blob');
    
    // Supprimer le fichier temporaire
    try {
      fs.unlinkSync(file.path);
      console.log('🗑️ Fichier temporaire supprimé');
    } catch (unlinkError) {
      console.warn('⚠️ Erreur lors de la suppression du fichier temporaire:', unlinkError.message);
    }

    // Retourner une réponse de test
    const response = {
      success: true,
      message: 'Test d\'upload réussi (sans Vercel Blob)',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        originalName: file.originalFilename
      },
      testMode: true
    };

    console.log('📤 Envoi de la réponse de test:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Erreur générale lors de l\'upload simple:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: "Erreur lors de l'upload de l'image (mode simple)",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 