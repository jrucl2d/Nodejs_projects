const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const { ESRCH } = require("constants");

// Set Storage Engine
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
  },
});

// Initialize Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("myImage", 5); // can upload to 5

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true); // error, pass true
  } else {
    cb("Error: Images Only!");
  }
}

// Init app
const app = express();

// EJS
app.set("view engine", "ejs");

// Static Settings
app.use(express.static("./public"));

app.get("/", (req, res) => res.render("index"));
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render("index", { msg: err });
    } else {
      // 파일 선택 안 했는데 보낼려고 할 때
      if (req.files === undefined) {
        res.render("index", { msg: "Error:No File Selected" });
      } else {
        let fileNames = [];
        for (i in req.files) {
          fileNames.push(req.files[i].filename);
        }
        res.render("index", {
          msg: "File Uploaded!",
          files: fileNames,
        });
      }
    }
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server is running`));
