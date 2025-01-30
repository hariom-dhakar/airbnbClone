const User = require("../Models/user.js");

module.exports.signup = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signupPage = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/signup");
    }

    // Create user and hash password
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    // Log in the user after registration
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Project!");
      res.redirect("/listings");
    });
  } catch (e) {
    // Handle duplicate email/username errors
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

