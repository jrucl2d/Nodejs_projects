const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

describe("isLoggedIn 테스트", () => {
  const res = {
    status: jest.fn(() => res), // chaining이므로 res를 리턴함
    send: jest.fn(),
  };
  const next = jest.fn();
  test("로그인, isLoggedIn OK", () => {
    const req = {
      isAuthenticated: jest.fn(() => true),
    };
    isLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
  test("안 로그인, isLoggedIn NO", () => {
    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isLoggedIn(req, res, next);
    expect(res.status).toBeCalledWith(403);
    expect(res.send).toBeCalledWith("로그인 필요");
  });
});

describe("isNotLoggedIn 테스트", () => {
  const res = {
    redirect: jest.fn(),
  };
  const next = jest.fn();
  test("로그인, isNotLoggedIn NO", () => {
    const req = {
      isAuthenticated: jest.fn(() => true),
    };
    isNotLoggedIn(req, res, next);
    const message = encodeURIComponent("로그인된 상태입니다.");

    expect(res.redirect).toBeCalledWith(`/?error=${message}`);
  });
  test("안 로그인, isNotLoggedIn OK", () => {
    const req = {
      isAuthenticated: jest.fn(() => false),
    };
    isNotLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});
