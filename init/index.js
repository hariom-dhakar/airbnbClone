require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/listing.js");
const mapboxToken = process.env.ACCESS_TOKEN;
const geocodingClient = require("@mapbox/mapbox-sdk/services/geocoding")({
  accessToken: mapboxToken,
});

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

  const updatedData = await Promise.all(
    initData.data.map(async (ob) => {
      const geocodeResponse = await geocodingClient
        .forwardGeocode({
          query: ob.location,
          limit: 1,
        })
        .send();
      const coordinates = geocodeResponse.body.features[0]?.geometry
        ?.coordinates || [0, 0];
      return {
        ...ob,
        owner: "679b44a4a5a838e19ec88aa0",
        geometry: {
          type: ob.geometry?.type || "Point",
          coordinates,
        },
      };
    })
  );
  await Listing.insertMany(updatedData);
  console.log("Data was initialized");
};

initDB();
