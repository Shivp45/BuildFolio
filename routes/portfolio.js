/**
 * routes/portfolio.js
 * Public portfolio routes
 * Serves the public-facing portfolio page at /u/:username
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

/* ─────────────────────────────────────────────
   PUBLIC PORTFOLIO
   GET /u/:username → Render public portfolio
───────────────────────────────────────────── */

/**
 * GET /u/:username
 * Looks up a user by their username, fetches their portfolio,
 * and renders the public portfolio page.
 * Returns a 404 view if user or portfolio is not found / not published.
 */
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // --- Find user by username (case-insensitive via lowercase storage) ---
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      // Username doesn't exist — show 404
      return res.status(404).render('portfolio', {
        portfolio: null,
        username: username,
        notFound: true
      });
    }

    // --- Fetch portfolio associated with this user ---
    const portfolio = await Portfolio.findOne({ user: user._id });

    if (!portfolio || !portfolio.published) {
      // Portfolio not found or unpublished — show 404
      return res.status(404).render('portfolio', {
        portfolio: null,
        username: username,
        notFound: true
      });
    }

    // --- Render the public portfolio page ---
    res.render('portfolio', {
      portfolio,
      username: user.username,
      notFound: false
    });
  } catch (err) {
    console.error('Public portfolio error:', err.message);
    res.status(500).render('portfolio', {
      portfolio: null,
      username: req.params.username,
      notFound: true
    });
  }
});

module.exports = router;
