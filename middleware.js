// middleware.js

// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    // Check if req.user exists (created by Passport if logged in)
    if (!req.user) {
        req.flash('error', 'You must be logged in to do that!');
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if the user is an admin
module.exports.isAdmin = (req, res, next) => {
    // Check if the logged-in user's role is 'admin'
    if (req.user.role !== 'admin') {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/listings'); // Redirect non-admins to the home page
    }
    next(); // If user is an admin, continue.
};