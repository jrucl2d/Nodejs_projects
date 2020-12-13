const fs = require("fs");

setInterval(() => {
  fs.unlink("./asdlkfjsdf.js", (err) => {
    // 노드의 내장 모둘에서 잡아냄
    if (err) {
      console.error("err"); // 만약 여기서 throw err을 하면 반드시 try catch 문으로 잡아내야 함
    }
  });
}, 1000);
