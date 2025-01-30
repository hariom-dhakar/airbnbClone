const User = require("../Models/user.js");
const axios = require("axios");

module.exports.signup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupPage = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/signup");
    }

    const user = new User({ email, username });
    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long.");
      return res.redirect("/signup");
    }
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Project!");
      res.redirect("/listings");
    });
  } catch (e) {
    if (e.code === 11000) {
      req.flash("error", "Email or Username already exists.");
    } else {
      req.flash("error", e.message);
    }
    res.redirect("/signup");
  }
};

module.exports.login = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.loginPage = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.redirectUrl || "/listings";
  delete req.session.redirectUrl; // Clear the session variable after use
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Cannot log out");
      return next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/listings");
  });
};
