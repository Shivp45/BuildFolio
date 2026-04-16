/**
 * server.js
 * Main entry point for the PortfolioBuilder Express application
 * Configures middleware, session management, routes, and starts the server
 */

// Load environment variables from .env file FIRST
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Database connection config
const connectDB = require('./config/db');

// Route handlers
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const portfolioRoutes = require('./routes/portfolio');

// ─── Initialize Express App ─────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ─── View Engine Setup ───────────────────────────────────────────────────────
// Use EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ────────────────────────────────────────────────────────────
// Serve CSS, JS, and images from the /public folder
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parsing Middleware ─────────────────────────────────────────────────
// Parse URL-encoded form data (from HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse JSON request bodies (for any API calls)
app.use(express.json());

// ─── Session Configuration ───────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_this',
  resave: false,              // Don't save session if nothing changed
  saveUninitialized: false,   // Don't create session until data is stored
  // Store sessions in MongoDB so they survive server restarts
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60   // Sessions expire after 14 days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
    httpOnly: true,  // Prevent client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === 'production' // HTTPS only in production
  }
}));

// ─── Global Template Variables ───────────────────────────────────────────────
// Make session data available in all EJS templates via res.locals
app.use((req, res, next) => {
  res.locals.sessionUser = req.session.username || null;
  res.locals.sessionUserId = req.session.userId || null;
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────

// Home page
app.get('/', (req, res) => {
  res.render('home');
});

// Authentication routes: /register, /login, /logout
app.use('/', authRoutes);

// Dashboard routes (protected): /dashboard, /dashboard/save
app.use('/dashboard', dashboardRoutes);

// Public portfolio routes: /u/:username
app.use('/u', portfolioRoutes);

// ─── DEV ONLY: Admin Debug Route ─────────────────────────────────────────────
// Visit http://localhost:3000/admin/users to see all registered users
// ⚠️  REMOVE THIS BEFORE SUBMITTING / DEPLOYING
if (process.env.NODE_ENV !== 'production') {
  const User      = require('./models/User');
  const Portfolio = require('./models/Portfolio');

  app.get('/admin/users', async (req, res) => {
    try {
      const users      = await User.find({}, '-password');      // exclude password hash
      const portfolios = await Portfolio.find({});
      res.json({
        totalUsers:      users.length,
        totalPortfolios: portfolios.length,
        users,
        portfolios
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).render('portfolio', {
    portfolio: null,
    username: '',
    notFound: true
  });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).send('<h1>500 - Internal Server Error</h1><p>' + err.message + '</p>');
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 PortfolioBuilder is running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
