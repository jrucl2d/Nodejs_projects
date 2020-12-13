const os = require("os"); // os모듈을 가져옴

console.log("운영체제 정보");
console.log(os.arch()); // process.arch와 동일
console.log(os.platform()); // process.platform과 동일
console.log(os.type()); // 운영체제 종류 보여줌
console.log(os.uptime()); // 운영체제 부팅 후 흐른 시간(초)
console.log(os.hostname()); // 컴퓨터 이름
console.log(os.release()); // 운영체제 버젼
console.log("경로");
console.log(os.homedir()); // 홈 디렉터리 경로
console.log(os.tmpdir()); // 임시 파일 저장 경로
console.log("cpu 정보");
console.log(os.cpus()); // 컴퓨터의 코어 정보
console.log(os.cpus().length);
console.log("메모리 정보");
console.log(os.freemem()); // 사용가능한 RAM 메모리
console.log(os.totalmem()); // 전체 메모리 용량
