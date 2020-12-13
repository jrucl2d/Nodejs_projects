const mongoose = require("mongoose");

module.exports = () => {
  const connect = () => {
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
    }
    mongoose.connect(
      "mongodb://아이디:비밀번호@localhost:27017/admin", // 주소를 이용해서 연결함.
      {
        dbName: "nodejs", // admin데이터베이스로 접속을 시도하지만 사용할 실제 데이터베이스는 nodejs
      },
      (err) => {
        // 마지막 콜백 함수로 연결 여부 확인
        if (err) {
          console.log("몽고디비 연결 에러", err);
        } else {
          console.log("몽고디비 연결 성공");
        }
      }
    );
  };
  connect(); // 연결 시도
  // 연결에 이벤트 리스너 달아두어서 에러 또는 연결 끊김에 대해서 내용 기록.
  mongoose.connection.on("error", (err) => {
    console.error("몽고디비 연결 에러", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.error("몽고디비 연결 끊김. 재연결 시도");
    connect();
  });
  require("./user"); // 두 개 스키마와 연결
  require("./comment");
};
