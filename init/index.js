const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");



const mongo_url = "mongodb://127.0.0.1:27017/test";
main() .then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect(mongo_url)
}

const initDB = async () => {
    await Listing.deleteMany({});
    // Dummy images ko aapke data ke sath replace kiya
    const listingsWithImages = initData.data.map(listing => {
        return {
            ...listing,
            image: listing.image || "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
        };
    });
    await Listing.insertMany(listingsWithImages);
    console.log("data was initialize");
};
 
initDB();
