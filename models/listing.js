const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,

    image: {
        type: String,
        default:"https://unsplash.com/photos/a-large-body-of-water-surrounded-by-rocks-u0MXjOhlu5Yult"
    },
    price: Number,
    location: String,
    country: String,
     reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing; 