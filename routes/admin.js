const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");
const Booking = require("../models/booking.js");

// Admin Bookings Route: GET /admin/bookings
router.get(
  "/bookings",
  isLoggedIn,
  isAdmin, // Protected Route for Admins only
  wrapAsync(async (req, res) => {
    // 1. Fetch all bookings from the database
    const allBookings = await Booking.find({})
      .populate("user") // 2. Populate user details (name, email etc.)
      .populate("listing"); // 3. Populate listing details (title etc.)

    // 4. Render a new admin page with the bookings data
    res.render("admin/bookings.ejs", { allBookings });
  })
);

module.exports = router;