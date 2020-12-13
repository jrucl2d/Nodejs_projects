const { addFollowing } = require("../controllers/user");

jest.mock("../models/user"); // test 원하는 곳 안에서 require하는 것은 jest.mock으로 가상 require시킬 수 있음
const User = require("../models/user"); // 데이터베이스 쿼리 날리는 부분까지 모킹

describe("addFollowing", () => {
  const req = {
    user: { id: 1 },
    params: { id: 2 },
  };
  const res = {
    send: jest.fn(),
    status: jest.fn(() => res),
  };
  const next = jest.fn();

  test("사용자를 찾아내고 success를 응답", async () => {
    User.findOne.mockReturnValue(
      Promise.resolve({
        id: 1,
        name: "babo",
        addFollowings(value) {
          return Promise.resolve(true); // 무조건 성공하는 addFollowings도 넣어줌
        },
      })
    ); // 무조건 모킹된 이 값을 리턴해짐.
    await addFollowing(req, res, next);
    expect(res.send).toBeCalledWith("success");
  });
  test("사용자를 못 찾아내고 res.status(404).send(no user)을 반환해야 함", async () => {
    User.findOne.mockReturnValue(Promise.resolve(null));
    await addFollowing(req, res, next);
    expect(res.status).toBeCalledWith(404);
    expect(res.send).toBeCalledWith("no user");
  });
  test("DB에서 에러 발생해서 next(err) 호출함", async () => {
    const err = "테스트용 에러";
    User.findOne.mockReturnValue(Promise.reject(err)); // 강제로 promise.reject 해주면 됨
    await addFollowing(req, res, next);
    expect(next).toBeCalledWith(err);
  });
});
