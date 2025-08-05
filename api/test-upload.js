const { put } = require('@vercel/blob');

module.exports = async (req, res) => {
  console.log('🧪 Test API upload appelée');
  
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
    console.log('🧪 Test de Vercel Blob...');
    
    // Test simple avec un buffer de test
    const testBuffer = Buffer.from('Test content for Vercel Blob');
    const testFileName = `test-${Date.now()}.txt`;
    
    console.log('🧪 Tentative d\'upload vers Vercel Blob...');
    
    const blob = await put(testFileName, testBuffer, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log('✅ Test Vercel Blob réussi:', blob);

    res.status(200).json({
      success: true,
      message: 'Test Vercel Blob réussi',
      blob: {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size
      }
    });

  } catch (error) {
    console.error('❌ Erreur test Vercel Blob:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      error: `Erreur test Vercel Blob: ${error.message}`,
      details: error.stack
    });
  }
}; 