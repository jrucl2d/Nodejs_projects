const express = require("express");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const sequelize = require("./models").sequelize;
const passport = require("passport");
const PORT = process.env.PORT || 8000;
const app = express();
sequelize.sync();

// Passport Config
require("./config/passport")(passport);

// Set Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// Set Debugger
app.use(morgan("dev"));

// Set Static files
app.use(express.static(path.join(__dirname, "public")));

// Set Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set Cookie & session, using flash
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.fail_msg = req.flash("fail_msg");
  next();
});

// Routers
app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));

// 404 Error Maker
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(PORT, () => {
  console.log("Server is running");
});
