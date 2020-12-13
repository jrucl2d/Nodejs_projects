const fs = require("fs");

fs.readdir("./folder", (err, dir) => {
  // 폴더 안의 내용물 확인 배열 안에 내부 파일과 폴더명이 나옴
  if (err) {
    throw err;
  }
  console.log("폴더 내용 확인", dir);
  fs.unlink("./folder/newfile.js", (err) => {
    // 파일을 삭제하는데 없다면 에러 나오므로 err로 확인 필요
    if (err) {
      throw err;
    }
    console.log("파일 삭제 성공");
    fs.rmdir("./folder", (err) => {
      // 폴더 삭제. 폴더 안에 파일 있다면 에러가 나므로 미리 파일 다 지우는 것 필요
      if (err) {
        throw err;
      }
      console.log("폴더 삭제 성공");
    });
  });
});
