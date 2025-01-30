const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview,isLoggedIn,isReviewAuthor } = require("../middleware.js");
const reviewsController = require("../controllers/review.controller.js");

//Reviews Route
router.post(
  "/",isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.createReview)
);

//Delete Review Route
router.delete(
  "/:reviewId",isLoggedIn,isReviewAuthor,
  wrapAsync(reviewsController.deleteReview)
);

module.exports = router;
