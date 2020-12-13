const fs = require("fs");

const content = `안녕하세요. 저는 누구입니까`;
fs.writeFile("./writeme.txt", content, (err) => {
  if (err) {
    throw err;
  }
  fs.readFile("./writeme.txt", (err, data) => {
    if (err) {
      throw err;
    }
    console.log(data.toString());
  });
});
