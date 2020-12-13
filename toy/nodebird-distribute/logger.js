const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: "info", // 심각도. error, warn, info, verbose, debug, silly
  format: format.json(), // 형식. json, label, timestamp, printf, imple, combine 등 있음. 보통 json, 기록시간 원하면 timestamp
  transports: [
    new transports.File({ filename: "combined.log" }), // 파일로 저장
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() })); // 콘솔에도 출력
}

module.exports = logger;
