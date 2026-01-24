#!/usr/bin/env node

const bcrypt = require('bcryptjs');

/**
 * Script pour générer le hash d'un mot de passe pour l'authentification admin
 * 
 * Usage: node generate-password-hash.js [mot_de_passe]
 * 
 * Si aucun mot de passe n'est fourni en argument, un prompt sera affiché
 */

async function generatePasswordHash() {
  try {
    let password;
    
    // Récupérer le mot de passe depuis les arguments ou via prompt
    if (process.argv[2]) {
      password = process.argv[2];
    } else {
      // Simple prompt pour le mot de passe
      process.stdout.write('Entrez le mot de passe admin: ');
      process.stdin.setEncoding('utf8');
      
      return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
          password = data.toString().trim();
          processPassword(password);
          resolve();
        });
      });
    }
    
    processPassword(password);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

async function processPassword(password) {
  try {
    // Validation du mot de passe
    if (!password || password.length < 8) {
      console.error('❌ Le mot de passe doit contenir au minimum 8 caractères');
      process.exit(1);
    }
    
    console.log('🔐 Génération du hash du mot de passe...');
    
    // Générer le hash avec bcrypt (salt rounds = 12 pour plus de sécurité)
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('\n✅ Hash généré avec succès !');
    console.log('📋 Ajoutez cette ligne à votre fichier .env :');
    console.log(`\nADMIN_PASSWORD_HASH=${hash}\n`);
    
    // Test de vérification
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      console.log('✅ Vérification du hash : OK');
    } else {
      console.error('❌ Erreur lors de la vérification du hash');
    }
    
    console.log('\n🛡️  IMPORTANT :');
    console.log('- Ne partagez JAMAIS ce hash publiquement');
    console.log('- Ajoutez le fichier .env à votre .gitignore');
    console.log('- Utilisez des mots de passe forts et uniques');
    console.log('- Changez le hash si le mot de passe est compromis');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du hash:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  generatePasswordHash();
}

module.exports = { generatePasswordHash };