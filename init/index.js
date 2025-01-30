require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/listing.js");

const dbUrl = process.env.MONGODB_URI;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((ob) => ({
    ...ob,
    owner: "679b44a4a5a838e19ec88aa0",
    geometry: {
      type: ob.geometry?.type || "Point",
      coordinates: ob.geometry?.coordinates || [0, 0],
    },
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
