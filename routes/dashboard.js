/**
 * routes/dashboard.js
 * Dashboard routes — protected by requireAuth middleware
 * Handles viewing and saving portfolio data
 */

const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const { requireAuth } = require('../middleware/auth');

/* ─────────────────────────────────────────────
   DASHBOARD HOME
   GET /dashboard → Show portfolio edit form
───────────────────────────────────────────── */

/**
 * GET /dashboard
 * Fetches the current user's portfolio and renders the dashboard form
 * Protected: User must be logged in
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Fetch existing portfolio for the logged-in user (may be null for new users)
    const portfolio = await Portfolio.findOne({ user: req.session.userId });

    res.render('dashboard', {
      username: req.session.username,
      portfolio: portfolio || {}, // Pass empty object if no portfolio yet
      success: req.query.saved === '1', // Show success message after save
      error: null
    });
  } catch (err) {
    console.error('Dashboard GET error:', err.message);
    res.render('dashboard', {
      username: req.session.username,
      portfolio: {},
      success: false,
      error: 'Failed to load portfolio data. Please try again.'
    });
  }
});

/* ─────────────────────────────────────────────
   SAVE PORTFOLIO
   POST /dashboard/save → Upsert portfolio in DB
───────────────────────────────────────────── */

/**
 * POST /dashboard/save
 * Receives form data and upserts the user's portfolio in MongoDB
 * Uses findOneAndUpdate with { upsert: true } to create or update
 * Protected: User must be logged in
 */
router.post('/save', requireAuth, async (req, res) => {
  try {
    const {
      name,
      tagline,
      about,
      email,
      github,
      linkedin,
      skills,        // Comma-separated string from the form
      theme,
      // Projects come as indexed arrays from the form:
      // projectTitle[], projectDescription[], projectTechStack[], projectLink[]
      projectTitle,
      projectDescription,
      projectTechStack,
      projectLink
    } = req.body;

    // --- Process Skills ---
    // Convert comma-separated string into a cleaned array of strings
    const skillsArray = skills
      ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    // --- Process Projects ---
    // The form sends project fields as arrays (one entry per project)
    let projectsArray = [];

    if (projectTitle) {
      // Normalize to arrays in case only one project was submitted (express parses single value as string)
      const titles = Array.isArray(projectTitle) ? projectTitle : [projectTitle];
      const descriptions = Array.isArray(projectDescription) ? projectDescription : [projectDescription || ''];
      const techStacks = Array.isArray(projectTechStack) ? projectTechStack : [projectTechStack || ''];
      const links = Array.isArray(projectLink) ? projectLink : [projectLink || ''];

      // Build the projects array
      projectsArray = titles
        .map((title, index) => ({
          title: title.trim(),
          description: (descriptions[index] || '').trim(),
          // Tech stack for each project is also comma-separated
          techStack: (techStacks[index] || '').split(',').map(t => t.trim()).filter(t => t.length > 0),
          link: (links[index] || '').trim()
        }))
        .filter(p => p.title.length > 0); // Ignore empty project entries
    }

    // --- Upsert Portfolio ---
    // findOneAndUpdate with upsert:true creates a new document if none exists
    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { user: req.session.userId }, // Filter: find portfolio belonging to this user
      {
        $set: {
          user: req.session.userId,
          name: (name || '').trim(),
          tagline: (tagline || '').trim(),
          about: (about || '').trim(),
          email: (email || '').trim().toLowerCase(),
          github: (github || '').trim(),
          linkedin: (linkedin || '').trim(),
          skills: skillsArray,
          projects: projectsArray,
          theme: ['minimal', 'dark', 'vibrant'].includes(theme) ? theme : 'minimal',
          updatedAt: Date.now()
        }
      },
      {
        new: true,   // Return the updated document
        upsert: true // Create if doesn't exist
      }
    );

    console.log(`✅ Portfolio saved for user: ${req.session.username}`);

    // Redirect back to dashboard with success indicator
    res.redirect('/dashboard?saved=1');
  } catch (err) {
    console.error('Dashboard save error:', err.message);

    // Fetch portfolio again to re-render the form with the error
    const portfolio = await Portfolio.findOne({ user: req.session.userId }).catch(() => ({}));
    res.render('dashboard', {
      username: req.session.username,
      portfolio: portfolio || {},
      success: false,
      error: 'Failed to save your portfolio. Please try again.'
    });
  }
});

module.exports = router;
