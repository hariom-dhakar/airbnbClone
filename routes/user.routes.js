const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { savedRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.controller.js");

router
  .route("/signup")
  .get(userController.signup) // Render signup form
  .post(wrapAsync(userController.signupPage)); // Handle user signup

router
  .route("/login")
  .get(userController.login) // Render login form
  .post(
    savedRedirectUrl, // Save original URL for redirection
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.loginPage // Handle successful login
  );

router.get("/logout", wrapAsync(userController.logout)); // Handle logout

module.exports = router;
