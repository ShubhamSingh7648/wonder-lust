const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware.js");

// Sign Up Routes
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        
        // Automatically login the user after they sign up
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

// Login Routes
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// This route now uses passport.authenticate and will flash an error on failure
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true, 
}), (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    res.redirect("/listings");
});

// Logout Route
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out.");
        res.redirect("/listings");
    });
});
// GET - User Profile Route
router.get("/profile", isLoggedIn, wrapAsync(async (req, res) => {
    // isLoggedIn gives us req.user, we use its ID to find the full user document
    const user = await User.findById(req.user._id);
    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }
    // Render a new profile page and pass the user's data to it
    res.render("users/profile.ejs", { user });
}));// GET - Edit Profile Form Route
router.get("/profile/edit", isLoggedIn, wrapAsync(async (req, res) => {
    // Find the current user's data to pre-populate the form
    const user = await User.findById(req.user._id);
    res.render("users/editProfile.ejs", { user });
}));


module.exports = router;
