const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const { data } = require("./data.js"); // Assuming data.js is in the root
require('dotenv').config(); // Loads .env file from the root

const dbUrl = process.env.ATLAS_DB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

const seedDB = async () => {
  // Clear all existing listings from the database
  await Listing.deleteMany({});
  console.log("Cleared existing listings.");

  // Insert the new sample data
  await Listing.insertMany(data);
  console.log("Database seeded successfully!");
};

main()
  .then(() => {
    console.log("Connected to DB for seeding.");
    seedDB().then(() => {
      console.log("Closing connection.");
      mongoose.connection.close();
    });
  })
  .catch((err) => console.log(err));