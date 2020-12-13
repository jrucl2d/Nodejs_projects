const mongoose = require("mongoose");

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true); // 쿼리 확인을 개발 중에만
  }
  mongoose.connect(
    "mongodb://아이디:비밀번호@localhost:27017/admin",
    {
      dbName: "nodejs",
      useNewUrlParser: true,
      useCreateIndex: true,
    },
    (err) => {
      if (err) {
        console.log("몽고디비 연결 에러 ", err);
      } else {
        console.log("몽고디비 연결 성공");
      }
    }
  );
};

mongoose.connection.on("error", (err) => {
  console.error("몽고디비 연결 에러 ", err);
});

mongoose.connection.on("disconnected", () => {
  console.error("몽고디비 연결 끊김. 연결 재시도");
  connect();
});

module.exports = connect;
