require("dotenv").config();
const mapboxToken = process.env.ACCESS_TOKEN;
const geocodingClient = require('@mapbox/mapbox-sdk/services/geocoding')({
  accessToken: mapboxToken,
});
const Listing = require("../Models/listing.js");

module.exports.search= async (req, res) => {
  try {
    let query = req.query.query;
      let listings;
      if (query) {
          listings = await Listing.find({ 
              title: { $regex: query, $options: "i" } // Case-insensitive search
          });
      } else {
          listings = await Listing.find(); // Fetch all listings if no query
      }
      res.render("listings/searchIndex.ejs", { listings, query }); // Pass listings to EJS template
  } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
  }
};

module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
};

module.exports.new = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.create = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  let url, filename;
  if (req.file) {
    url = req.file.path;
    filename = req.file.filename;
  }
  const nListing = new Listing(req.body.listing);
  nListing.owner = req.user._id;
  nListing.geometry = response.body.features[0].geometry;
  if (req.file) {
    nListing.image = { url, filename };
  }
  await nListing.save();
  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  originalImage = originalImage.replace("upload", "upload/w_200");
  res.render("listings/edit.ejs", { listing, originalImage });
};

module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Updated a listing!");
  res.redirect(`/listings/${id}`);
};
module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing, newReview: {} });
};

module.exports.destroy = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Deleted a listing!");
  res.redirect("/listings");
};
