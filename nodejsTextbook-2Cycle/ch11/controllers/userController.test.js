const { addFollowing } = require("./userController");

jest.mock("../models/User");
const User = require("../models/User");

describe("addFollowing Test", () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  };
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(),
  };
  const next = jest.fn();
  test("사용자 findOne OK, Following 추가, success 응답", async () => {
    User.findOne.mockReturnValue(
      Promise.resolve({
        id: 1,
        name: "test",
        addFollowings(value) {
          return Promise.resolve(true);
        },
      })
    ); // 무조건 이 값이 반환됨
    await addFollowing(req, res, next); // 비동기 함수라서 await 붙여줘야 함
    expect(res.send).toBeCalledWith("success");
  });

  test("사용자 findOne NO, status 404, no user 응답", async () => {
    User.findOne.mockReturnValue(null);
    await addFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith("no user");
  });

  test("DB 에러, 에러 응답,", async () => {
    const error = "테스트 에러";
    User.findOne.mockReturnValue(Promise.reject(error)); // 무조건 이 값이 반환됨
    await addFollowing(req, res, next);
    expect(next).toBeCalledWith(error);
  });
});
