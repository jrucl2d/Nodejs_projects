const Sequelize = require("sequelize");
const User = require("./user");
const config = require("../config/config.json")["test"];
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

describe("User 모델", () => {
  test("static init 메소드 호출", () => {
    expect(User.init(sequelize)).toBe(User); // 리턴한 값이 자기 자신, User와 같아야 함
  });
  test("static associate 메소드 호출", () => {
    const db = {
      User: {
        hasMany: jest.fn(),
        belongsToMany: jest.fn(),
      },
      Post: {},
    };
    User.associate(db);
    expect(db.User.hasMany).toBeCalledWith(db.Post); // 이 부분을 어떻게 작성하냐에 따라 잘 해도 오류 발생 가능
    expect(db.User.belongsToMany).toBeCalledTimes(3);
  });
});
