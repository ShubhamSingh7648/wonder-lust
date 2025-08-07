// ===================================
//      REQUIRE STATEMENTS
// ===================================
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Joi = require("joi");

// Models & Utils
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");

// Routers
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
const adminRouter = require("./routes/admin.js");
const reviewRouter = require("./routes/review.js"); // Added review router require

// Middleware Functions
const { isLoggedIn, isAdmin } = require('./middleware.js');

const app = express();

// ===================================
//      EXPRESS & EJS SETUP
// ===================================
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ===================================
//      DATABASE CONNECTION
// ===================================
const dbUrl = process.env.ATLAS_DB_URL;
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
}

// ===================================
//      SESSION & AUTHENTICATION MIDDLEWARE
// ===================================
const sessionOptions = {
    secret: process.env.SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set local variables for all templates
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// ===================================
//      ROUTERS
// ===================================
app.use("/admin", adminRouter);
app.use("/listings/:id/bookings", bookingRouter);
app.use("/listings/:id/reviews", reviewRouter); // FIX #1: Moved this line here
app.use("/", userRouter);

// ===================================
//      LISTING ROUTES (in app.js)
// ===================================
// Home page redirect
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Index route with search
app.get("/listings", wrapAsync(async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("listings/index.ejs", { alllistings, searchTerm: "" });
}));
 
// New Listing Form - PROTECTED
app.get("/listings/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("listings/new.ejs");
});
 
// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    // FIX #2: Added .populate() to fetch reviews and their authors
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });

    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));
 
// Create Listing Route - PROTECTED
app.post("/listings", isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
}));

// Edit Listing Form - PROTECTED
app.get("/listings/:id/edit", isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
}));

// Update Route - PROTECTED
app.put("/listings/:id", isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}));

// Delete Route - PROTECTED
app.delete("/listings/:id", isLoggedIn, isAdmin, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

// ===================================
//      ERROR HANDLING MIDDLEWARE
// ===================================
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("listings/error.ejs", {
    message,
    currentUser: req.user,
    success: [],
    error: [],
  });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});