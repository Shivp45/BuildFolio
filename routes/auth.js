/**
 * routes/auth.js
 * Authentication routes: Register, Login, Logout
 * Handles user creation and session management
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

/* ─────────────────────────────────────────────
   REGISTER
   GET  /register  → Show registration form
   POST /register  → Process new user creation
───────────────────────────────────────────── */

/**
 * GET /register
 * Renders the registration page
 * Redirects to dashboard if already logged in
 */
router.get('/register', (req, res) => {
  // If user is already logged in, go to dashboard
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null, formData: {} });
});

/**
 * POST /register
 * Creates a new user account
 * Validates input, checks for duplicates, hashes password via model pre-save hook
 */
router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  try {
    // --- Input Validation ---
    if (!username || !email || !password || !confirmPassword) {
      return res.render('register', {
        error: 'All fields are required.',
        formData: { username, email }
      });
    }

    if (password !== confirmPassword) {
      return res.render('register', {
        error: 'Passwords do not match.',
        formData: { username, email }
      });
    }

    if (password.length < 6) {
      return res.render('register', {
        error: 'Password must be at least 6 characters.',
        formData: { username, email }
      });
    }

    // Validate username format (lowercase letters, numbers, underscores only)
    const usernameRegex = /^[a-z0-9_]+$/;
    if (!usernameRegex.test(username.toLowerCase())) {
      return res.render('register', {
        error: 'Username can only contain lowercase letters, numbers, and underscores.',
        formData: { username, email }
      });
    }

    // --- Check for existing user ---
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.render('register', {
        error: 'An account with this email already exists.',
        formData: { username, email }
      });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.render('register', {
        error: 'This username is already taken. Please choose another.',
        formData: { username, email }
      });
    }

    // --- Create new user ---
    // Password is hashed by the pre-save hook in User model
    const newUser = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password // plain text — will be hashed by model middleware
    });

    await newUser.save();

    // --- Automatically log in after registration ---
    req.session.userId = newUser._id;
    req.session.username = newUser.username;

    // Redirect to dashboard to fill in portfolio details
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Register error:', err.message);
    res.render('register', {
      error: 'Something went wrong. Please try again.',
      formData: { username, email }
    });
  }
});

/* ─────────────────────────────────────────────
   LOGIN
   GET  /login  → Show login form
   POST /login  → Process login credentials
───────────────────────────────────────────── */

/**
 * GET /login
 * Renders the login page
 * Redirects to dashboard if already logged in
 */
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

/**
 * POST /login
 * Validates email + password, creates session on success
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // --- Basic validation ---
    if (!email || !password) {
      return res.render('login', { error: 'Email and password are required.' });
    }

    // --- Find user by email ---
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Use a generic error to prevent user enumeration attacks
      return res.render('login', { error: 'Invalid email or password.' });
    }

    // --- Compare password with stored hash using bcryptjs ---
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    // --- Create session ---
    req.session.userId = user._id;
    req.session.username = user.username;

    // Redirect to dashboard after successful login
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err.message);
    res.render('login', { error: 'Something went wrong. Please try again.' });
  }
});

/* ─────────────────────────────────────────────
   LOGOUT
   GET /logout → Destroy session and redirect home
───────────────────────────────────────────── */

/**
 * GET /logout
 * Destroys the user session and redirects to the home page
 */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
    }
    res.redirect('/');
  });
});

module.exports = router;
