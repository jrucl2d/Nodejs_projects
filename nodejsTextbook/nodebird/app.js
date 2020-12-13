const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const dotenv = require("dotenv");
const nunjucks = require("nunjucks");
const passport = require("passport");
const PORT = process.env.PORT || 8000;
const app = express();
dotenv.config();

// Passport Config
require("./config/passport")(passport);

// Database Settings
const { sequelize } = require("./models");
sequelize
  .sync({ force: false })
  .then(console.log("Database linked.."))
  .catch(console.error);

// Logger Settings
app.use(morgan("dev"));

// View Settings
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

// Static Settings
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads"))); // psuedo url, :8000/img/something

// Body Parser Settings
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie, Session Settings
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Router Settings
app.use("/", require("./routes/index")); // page routing
app.use("/auth", require("./routes/auth")); // auth routing(login, logout, register)
app.use("/post", require("./routes/post")); // post routing
app.use("/user", require("./routes/user")); // user routing

// 404 Error Maker
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} router is missing`);
  error.status = 404;
  next(error);
});

// Error Catcher
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.state || 500);
  res.render("error");
});

app.listen(PORT, () => {
  console.log("Server running");
});
