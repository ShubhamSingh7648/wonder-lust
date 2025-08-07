// File: models/booking.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    guests: {
        type: Number,
        required: true,
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;