const fs = require("fs");

fs.access(
  // fs.access(경로, 옵션, 콜백), 폴더나 파일에 접근 가능한지 체크. 옵션은 파일 존재여부, 읽기 권한 여부, 쓰기 권한 여부
  "./folder",
  fs.constants.F_OK || fs.constants.R_OK || fs.constants.W_OK,
  (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log("폴더 없음"); // 파일 미존재시 에러가 바로 ENOENT
        fs.mkdir("./folder", (err) => {
          // 폴더 생성시 이미 존재하면 에러가 나므로 access로 미리 체크 필요
          if (err) {
            throw err;
          }
          console.log("폴더 만들기 성공");
          fs.open("./folder/file.js", "w", (err, fd) => {
            // 파일의 아이디를 가져옴(fd). 없다면 생성 후에 가져옴 가져온 아이디로 파일 읽거나 쓸 수 있음.
            if (err) {
              throw err;
            }
            console.log("빈 파일 만들기 성공", fd);
            fs.write(fd, "zzz", (err) => {
              if (err) {
                throw err;
              }
              console.log("파일에 썼다.actions");
            });
            fs.rename("./folder/file.js", "./folder/newfile.js", (err) => {
              // 두 번째 인자에 위치를 바꾸면 잘라내기 기능
              if (err) {
                throw err;
              }
              console.log("이름 바꾸기 성공");
            });
          });
        });
      } else {
        console.log("이미 폴더 있음");
      }
    }
  }
);
