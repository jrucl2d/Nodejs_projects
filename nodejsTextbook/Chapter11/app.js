const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const flash = require("connect-flash");
const ColorHash = require("color-hash");
const PORT = process.env.PORT || 8000;

require("dotenv").config();
const app = express();
require("./schemas")(); // using database

app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
app.use(flash());

// Router
app.use("/", require("./routes")); // index router

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

const server = app.listen(PORT, () => console.log("Server is running"));

require("./socket")(server);
