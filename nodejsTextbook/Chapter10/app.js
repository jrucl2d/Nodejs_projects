const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const morgan = require("morgan");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 8001;

// Setting env
dotenv.config();

// Setting sequelize
const { sequelize } = require("./models");

// Passport config
require("./config/passport")(passport);

// Setting view engine
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

// Database connection
sequelize
  .sync({ force: false })
  .then(console.log("Database connected.."))
  .catch(console.error);

// Setting logger
app.use(morgan("dev"));

// Setting static files
app.use(express.static(path.join(__dirname, "public")));

// Setting bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setting cookie & session
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

// Initializeing passport
app.use(passport.initialize());
app.use(passport.session());

// Routing
app.use("/v1", require("./routes/v1"));
app.use("/v2", require("./routes/v2"));
app.use("/auth", require("./routes/auth"));
app.use("/", require("./routes"));

// 404 error maker
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} router is missing`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(PORT, () => {
  console.log("server is running..");
});
