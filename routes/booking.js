// File: routes/booking.js

const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams is essential
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const Booking = require("../models/booking.js"); // Requires the MODEL file
const Listing = require("../models/listing.js");

// The path is just "/" because app.js provides the rest
router.post(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    const { checkin, checkout, guests } = req.body.booking;

    if (!checkin || !checkout || !guests) {
      req.flash("error", "Please fill out all fields.");
      return res.redirect(`/listings/${id}`);
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(checkin);
    const endDate = new Date(checkout);
    const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay));
    
    const totalPrice = diffDays * listing.price;

    const newBooking = new Booking({
      user: req.user._id,
      listing: id,
      checkIn: startDate,
      checkOut: endDate,
      price: totalPrice,
      guests: parseInt(guests),
    });

    await newBooking.save();

    req.flash("success", "Booking confirmed! Enjoy your trip.");
    res.redirect(`/listings/${id}`); 
  })
);

module.exports = router;