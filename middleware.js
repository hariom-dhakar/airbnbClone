const Listing = require("./Models/listing.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./Models/reviews.js");

module.exports.isLoggedIn = (req, res, next) => { 
    try {
        if (!req.isAuthenticated()) {
            req.session.redirectUrl = req.originalUrl;
            req.flash("error", "You must be signed in");
            return res.redirect("/login");
        }
        next();
    } catch (err) {
        next(err);
    }
};
 

module.exports.savedRedirectUrl = (req, res, next) => { 
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner = async (req, res, next) => {   
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    if ( !listing.owner || !listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You do not have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
}; 

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body.listing ? req.body : { listing: req.body });
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      error = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, error);
    } else {
      next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete");
        return res.redirect(`/listings/${id}`);
    }
    next();
};