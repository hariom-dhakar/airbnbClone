const Reviews = require("../Models/reviews.js");
const Listing = require("../Models/listing.js");

module.exports.createReview = async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
      }
  
      const newReview = new Reviews({
        ...req.body.review,
        author: req.user._id,
      });
  
      await newReview.save();
      listing.reviews.push(newReview);
      await listing.save();
  
      req.flash("success", "Created a Review!");
      res.redirect(`/listings/${listing._id}`);
    } catch (err) {
      req.flash("error", "Something went wrong while creating the review!");
      res.redirect("/listings");
    }
  };
  
  module.exports.deleteReview = async (req, res) => {
    try {
      const { id, reviewId } = req.params;
  
      const listing = await Listing.findById(id);
      if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
      }
  
      const review = await Reviews.findById(reviewId);
      if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
      }
  
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Reviews.findByIdAndDelete(reviewId);
  
      req.flash("success", "Deleted a Review!");
      res.redirect(`/listings/${id}`);
    } catch (err) {
      req.flash("error", "Something went wrong while deleting the review!");
      res.redirect("/listings");
    }
  };
  