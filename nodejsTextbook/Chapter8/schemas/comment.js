const mongoose = require("mongoose");

const { Schema } = mongoose;
const {
  Types: { ObjectId },
} = Schema;
const commentSchema = new Schema({
  commenter: {
    type: ObjectId, // ref인 User 스키마의 사용자 ObjectId가 자료형임. JOIN과 비슷한 기능을 함.
    required: true,
    ref: "User",
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema); // 컬렉션 이름은 첫 인자의 Comment에서 소문자 복수형인 comments가 됨. 세 번째 인자로 이름 줄 수 있다
