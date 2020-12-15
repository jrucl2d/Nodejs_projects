const User = require("./User");
const config = require("../config/config.json")["test"];
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

describe("User 모델 테스트", () => {
  test("static init 호출", () => {
    expect(User.init(sequelize)).toBe(User); // 결과 값이 super(자기 자신)과 일치
  });
  test("static associate 호출", () => {
    const db = {
      User: {
        hasMany: jest.fn(),
        belongsToMany: jest.fn(),
      },
    };
    User.associate(db);
    expect(db.User.hasMany).toBeCalledTimes(2);
    expect(db.User.belongsToMany).toBeCalledTimes(3);
  });
});
