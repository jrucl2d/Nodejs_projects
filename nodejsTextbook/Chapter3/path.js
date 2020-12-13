const path = require("path");

const string = __filename;

console.log(path.sep); // 경로의 구분자. POSIX는 /, 윈도우는 \
console.log(path.delimiter); // 환경 변수의 구분자. POSIX는 :, 윈도우는 ;

console.log(path.dirname(string)); // 파일이 위치한 폴더 경로
console.log(path.extname(string)); // 파일의 확장자
console.log(path.basename(string)); // 파일의 이름을 보여줌. 파일의 이름만 표시하고 싶으면 뒤에 확장자를 넣어주면 됨
console.log(path.basename(string, path.extname(string)));

console.log(path.parse(string)); // 파일 경로를 root, dir, base, ext, name으로 분리
console.log(
  // parse한 객체를 파일 경로로 합침
  path.format({
    dir: "C://users//yuseonggeun",
    name: "path",
    ext: ".js",
  })
);
console.log(path.normalize("/Users\\yuseonggeun///path.js")); // 경로 구분자를 잘못쓰거나 혼용했을 때 정상 경로로 바꿔줌
console.log(path.isAbsolute("/Users/yuseonggeun")); // 절대 경로인지 알려줌
console.log(path.isAbsolute("./home"));
console.log(path.relative("C://users//yuseonggeun//path.js", "C://")); // 경로를 두 개 넣으면 첫 번째 경로에서 두 번째 경로로 가는 방법을 알려줌
console.log(path.join(__dirname, "...", "..", "/users", ".", "/yuseonggeun")); // 경로를 합쳐줌. ..이나 .도 잘 해줌
console.log(path.resolve(__dirname, "..", "users", ".", "/yuseonggeun"));
