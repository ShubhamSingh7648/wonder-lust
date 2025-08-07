const express = require("express");
// mergeParams allows us to access :id from the parent route in app.js
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// POST Review Route
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
    // 1. Find the listing the new review belongs to
    let listing = await Listing.findById(req.params.id);
    
    // 2. Create a new review object from the form data
    let newReview = new Review(req.body.review);
    
    // 3. Set the author of the review to the current user
    newReview.author = req.user._id;

    // 4. Add the new review to the listing's reviews array
    listing.reviews.push(newReview);

    // 5. Save both the new review and the updated listing
    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
}));

module.exports = router;