/**
 * models/Portfolio.js
 * Mongoose schema and model for user Portfolio data
 * Stores all the public-facing profile information
 */

const mongoose = require('mongoose');

/**
 * Sub-schema for individual Project entries
 * Each portfolio can have multiple projects
 */
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // Tech stack as an array of strings (e.g. ['React', 'Node.js'])
  techStack: {
    type: [String],
    default: []
  },
  // Optional external link to live demo or repository
  link: {
    type: String,
    trim: true,
    default: ''
  }
});

/**
 * Main Portfolio schema
 */
const PortfolioSchema = new mongoose.Schema({
  // Reference to the User who owns this portfolio (one-to-one)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user has one portfolio
  },

  // Display name (can differ from username)
  name: {
    type: String,
    trim: true,
    default: ''
  },

  // Short tagline / subtitle shown on hero section
  tagline: {
    type: String,
    trim: true,
    default: ''
  },

  // Longer bio/about section
  about: {
    type: String,
    trim: true,
    default: ''
  },

  // Contact email shown on portfolio (can differ from login email)
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },

  // Social links
  github: {
    type: String,
    trim: true,
    default: ''
  },
  linkedin: {
    type: String,
    trim: true,
    default: ''
  },

  // Skills stored as an array of strings
  skills: {
    type: [String],
    default: []
  },

  // Array of project objects
  projects: {
    type: [ProjectSchema],
    default: []
  },

  // Visual theme: 'minimal' | 'dark' | 'vibrant'
  theme: {
    type: String,
    enum: ['minimal', 'dark', 'vibrant'],
    default: 'minimal'
  },

  // Whether the portfolio is publicly visible
  published: {
    type: Boolean,
    default: true
  },

  // Last updated timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` every time the portfolio is saved
PortfolioSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
