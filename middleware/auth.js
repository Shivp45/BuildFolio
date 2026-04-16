/**
 * middleware/auth.js
 * Authentication middleware for protecting routes
 * Checks if a valid session exists before allowing access to protected pages
 */

/**
 * requireAuth - Middleware to protect routes that require a logged-in user
 * Checks for req.session.userId set during login
 * Redirects to /login if the session does not exist
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireAuth = (req, res, next) => {
  // Check if the user session exists
  if (req.session && req.session.userId) {
    // Session found — user is authenticated, proceed to next middleware/route
    return next();
  }

  // No session — redirect to login page
  // Store the originally requested URL so we can redirect back after login (optional enhancement)
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

module.exports = { requireAuth };
