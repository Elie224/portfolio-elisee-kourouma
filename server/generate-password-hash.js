#!/usr/bin/env node

/**
 * Script utilitaire pour générer le hash bcrypt d'un mot de passe admin
 * 
 * Ce script permet de générer un hash sécurisé pour le mot de passe administrateur.
 * Le hash généré doit être ajouté à la variable d'environnement ADMIN_PASSWORD_HASH.
 * 
 * Usage:
 *   node generate-password-hash.js [mot_de_passe]
 * 
 * Si aucun mot de passe n'est fourni en argument, un prompt interactif sera affiché.
 * 
 * Sécurité:
 *   - Utilise bcrypt avec 12 rounds de salt (équilibre sécurité/performance)
 *   - Le hash généré est unique à chaque exécution (salt aléatoire)
 *   - Ne jamais partager le hash publiquement
 * 
 * @author Nema Elisée Kourouma
 * @date 2026
 */

const bcrypt = require('bcryptjs');

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