const express = require("express");
require("express-async-errors");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const listings = require("./routes/listings.routes.js");
const reviews = require("./routes/reviews.routes.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./Models/user.js");
const usersRouter = require("./routes/user.routes.js");
require("dotenv").config();

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

app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.get("/favicon.ico", (req, res) => res.status(204));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET_CODE,
  },
  touchafter: 24 * 3600,
});

store.on("error",(error)=>{
  console.log("error: ",error)
})

const sessionOptions = {
  store,
  secret: process.env.SECRET_CODE,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", usersRouter);

app.use((err, req, res, next) => {
  console.error(err);
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("error.ejs", { err });
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is listening to port ${PORT}`);
});
