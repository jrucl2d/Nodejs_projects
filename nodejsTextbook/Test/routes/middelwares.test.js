// 기본적인 테스트. 설명, 테스트할 것
// test("1+1은 2입니다.", () => {
//   expect(1 + 1).toEqual(2);
// });

const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
// if문 개수에 따라서 테스트가 여러 개가 나올 수 있다. 없으면 통째로 하나가 테스트.
// describe로 그룹화
describe("isLoggedIn", () => {
  // 가짜 객체 및 함수를 만들어줌 -> 모킹이라고 부름.

  const res = {
    status: jest.fn(() => res), // method chaining을 위해서 res를 리턴
    send: jest.fn(), // 리턴하는 것이 없으면 그냥 fn만 쓰면 됨
  };
  const next = jest.fn();
  test("로그인되어 있으면 isLoggedIn이 next를 호출함", () => {
    const req = {
      isAuthenticated: jest.fn(() => true), // true를 리턴하는 가짜 req.isAuthenticated를 만들음
    };
    isLoggedIn(req, res, next); // 한 번 실행해보면 안에 req.isAuthenticated가 true이므로 가짜 next를 호출한다.
    expect(next).toBeCalledTimes(1); // 여기서 next가 몇 번 실행되었는지 횟수를 파악
  });
  test("로그인되어 있지 않으면 isLoggedIn이 에러를 냄", () => {
    const req = {
      isAuthenticated: jest.fn(() => false), // false일 경우 에러나는 과정을 확인해야 함
    };
    isLoggedIn(req, res, next);
    expect(res.status).toBeCalledWith(403);
    expect(res.send).toBeCalledWith("로그인 필요");
  });
});

describe("isNotLoggedIn", () => {
  const res = {
    status: jest.fn(() => res), // method chaining을 위해서 res를 리턴
    send: jest.fn(), // 리턴하는 것이 없으면 그냥 fn만 쓰면 됨
    redirect: jest.fn(),
  };
  const next = jest.fn();

  test("로그인되어 있지 않으면 isNotLoggedIn이 next를 호출함", () => {
    const req = {
      isAuthenticated: jest.fn(() => false), // false일 경우 에러나는 과정을 확인해야 함
    };
    isNotLoggedIn(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
  test("로그인되어 있으면 isNotLoggedIn이 에러를 냄", () => {
    const req = {
      isAuthenticated: jest.fn(() => true), // false일 경우 에러나는 과정을 확인해야 함
    };
    const message = encodeURIComponent("로그인 한 상태입니다");
    isNotLoggedIn(req, res, next);
    expect(res.redirect).toBeCalledWith(`/?error=${message}`);
  });
});
