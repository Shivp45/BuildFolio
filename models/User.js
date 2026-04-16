/**
 * models/User.js
 * Mongoose schema and model for User accounts
 * Handles authentication data: username, email, hashed password
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Username: unique, lowercase, trimmed — used in public portfolio URL (/u/:username)
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
  },

  // Email: unique, used for login
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },

  // Password: stored as a bcrypt hash — NEVER plain text
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Timestamp for when the account was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Pre-save middleware: Hash the password before saving to the database
 * Only hashes if the password field has been modified (avoids double-hashing)
 */
UserSchema.pre('save', async function (next) {
  // Skip hashing if password hasn't been modified
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt with cost factor 12 (good balance of security and speed)
    const salt = await bcrypt.genSalt(12);
    // Hash the plain-text password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Instance method: Compare a plain-text password with the stored hash
 * @param {string} candidatePassword - The password entered by the user
 * @returns {boolean} - True if passwords match
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
