const fs = require("fs");
fs.copyFile("./forpipe.txt", "./forepipe3.txt", (err) => {
  if (err) {
    return console.error(err);
  }
  console.log("복사 성공");
});
