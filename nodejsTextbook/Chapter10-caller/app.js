const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 8002;

dotenv.config();
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
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

// Routes
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
