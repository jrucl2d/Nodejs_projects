const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database, // config에 저장되어 있는 데이터베이스 정보. nodebird, 아이디, 비밀번호
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require("./user")(sequelize, Sequelize);
db.Post = require("./post")(sequelize, Sequelize);
db.Hashtag = require("./hashtag")(sequelize, Sequelize);
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });

db.User.belongsToMany(db.User, {
  // 같은 테이블 내에서의 N:M 관계
  foreignKey: "followingId",
  as: "Followers", // Join 시 사용하는 이름. getFollowers 또는 addFollowers 등으로 사용 가능
  through: "Follow",
});
db.User.belongsToMany(db.User, {
  foreignKey: "followingId",
  as: "Followings",
  through: "Follow",
});

module.exports = db;
