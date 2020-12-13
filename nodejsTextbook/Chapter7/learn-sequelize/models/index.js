// 자동 생성된 코드는 오류도 많고 불필요한 코드가 많으므로 다음과 같이 수정한다.

const path = require("path");
const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "..", "config", "config.json"))[
  env
];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

<<<<<<< HEAD
// index와 연결, db객체를 require해서 User와 Comement 모델에 접근할 수 있다.
db.User = require("./user")(sequelize, Sequelize);
db.Comment = require("./comment")(sequelize, Sequelize);
// 관계 따로 설정. user와 comment는 1:N 관계이다.
db.User.hasMany(db.Comment, { foreinKey: "commenter", sourceKey: "id" });
db.Comment.belongsTo(db.User, { foreinKey: "commenter", targetKey: "id" }); // User 모델의 id가 Comment모델의 commenter 컬럼에 들어가게 된다.
=======
// 관계 명시
db.User = require("./user")(sequelize, Sequelize);
db.Comment = require("./comment")(sequelize, Sequelize);

// 1:N의 관계이다. User모델의 id가 Comment 모델의 commenter 컬럼에 들어가게 된다.
db.User.hasMany(db.Comment, { foreignKey: "commenter", sourceKey: "id" });
db.Comment.belongsTo(db.User, { foreignKey: "commenter", targetKey: "id" });
>>>>>>> ef917fcc8250683fb139ad14a21c642bac3ac1c4

module.exports = db;
