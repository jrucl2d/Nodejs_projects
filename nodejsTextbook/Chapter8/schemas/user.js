const mongoose = require("mongoose");

const { Schema } = mongoose; // Schema 생성자로 스키마를 만든다.
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  married: {
    type: Boolean,
    required: true,
  },
  comment: String, // 다른 조건이 붙지 않는다면 간단하게 타입만 명시해도 됨
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema); // 몽고디비 컬렉션을 연결
