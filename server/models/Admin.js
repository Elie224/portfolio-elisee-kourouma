/**
 * Modele Admin - Stockage des identifiants administrateur dans MongoDB
 *
 * Avantages par rapport aux variables d environnement :
 *  - Permet le changement de mot de passe sans redemarrage du serveur
 *  - Supporte plusieurs admins
 *  - Permet la rotation de JWT_SECRET cote serveur
 *
 * Le mot de passe est stocke uniquement sous forme de hash bcrypt (12 rounds).
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { logWarn, logError, logSuccess } = require('../utils/logger');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/,
    maxlength: 180
  },
  passwordHash: {
    type: String,
    required: true,
    maxlength: 200
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLoginAt: { type: Date, default: null },
  lastLoginIp: { type: String, default: null, maxlength: 64 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

adminSchema.index({ email: 1 }, { unique: true });

adminSchema.statics.findActiveByEmail = function (email) {
  if (!email) return null;
  return this.findOne({ email: String(email).toLowerCase().trim(), active: true });
};

adminSchema.methods.verifyPassword = function (plain) {
  if (!plain || !this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

adminSchema.methods.changePassword = async function (newPlain) {
  if (typeof newPlain !== 'string' || newPlain.length < 8) {
    throw new Error('Le nouveau mot de passe doit contenir au moins 8 caracteres');
  }
  this.passwordHash = await bcrypt.hash(newPlain, 12);
  this.updatedAt = new Date();
  return this.save();
};

adminSchema.statics.bootstrapFromEnv = async function () {
  const envEmail = process.env.ADMIN_EMAIL;
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (!envEmail || !envHash) {
    logWarn('Admin.bootstrapFromEnv: ADMIN_EMAIL ou ADMIN_PASSWORD_HASH manquant - skip');
    return null;
  }
  const count = await this.countDocuments();
  if (count > 0) return null;
  try {
    const admin = await this.create({
      email: envEmail,
      passwordHash: envHash,
      role: 'superadmin',
      active: true
    });
    logSuccess('Admin par defaut migre depuis .env vers MongoDB: ' + admin.email);
    return admin;
  } catch (err) {
    logError('Admin.bootstrapFromEnv: erreur migration', err);
    return null;
  }
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
