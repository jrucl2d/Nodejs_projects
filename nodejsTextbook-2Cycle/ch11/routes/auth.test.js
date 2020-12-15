const request = require("supertest");
const { sequelize } = require("../models/index");
const app = require("../app");

beforeAll(async () => {
  await sequelize.sync(); // 테이블이 생성된 채로 시작하게 된다.
});

describe("POST /join", () => {
  test("로그인 안 했으면 가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "yu@a.com",
        nick: "yu",
        password: "1234",
      })
      .expect("Location", "/")
      .expect(302, done);
  });
});

describe("POST /login", () => {
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post(`/auth/login`)
      .send({
        email: "yu@a.com",
        password: "1234",
      })
      .end(done);
  });

  test("이미 로그인 했는데 가입하면 redirect /", (done) => {
    const message = encodeURIComponent("로그인된 상태입니다.");
    agent
      .post("/auth/join")
      .send({
        email: "yu@a.com",
        password: "1234",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });

  test("이미 로그인 했으면 redirect /", (done) => {
    const message = encodeURIComponent("로그인된 상태입니다.");
    agent
      .post("/auth/login")
      .send({
        email: "yu@a.com",
        password: "1234",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

describe("POST /login", () => {
  // 비동기 요청인 경우 done을 넣어서 마지막에 done을 넣어줘야 한다. 반드시
  test("가입되지 않은 회원", (done) => {
    const message = encodeURIComponent("가입되지 않은 회원입니다.");
    request(app)
      .post("/auth/login")
      .send({
        email: "y55u@a.com",
        password: "1234",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });

  test("로그인 수행", (done) => {
    request(app)
      .post("/auth/login")
      .send({
        email: "yu@a.com",
        password: "1234",
      })
      .expect("Location", `/`)
      .expect(302, done);
  });

  test("비밀번호 틀림", (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다.");

    request(app)
      .post("/auth/login")
      .send({
        email: "yu@a.com",
        password: "12ㅎ23234",
      })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  test("로그인 되어있지 않으면 403", async (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  // agent : 한 번 로그인 한 상태를 유지해서 다른 테스트를 할 수 있다.
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post(`/auth/login`)
      .send({
        email: "yu@a.com",
        password: "1234",
      })
      .end(done);
  });

  test("로그아웃 수행", async (done) => {
    agent.get("/auth/logout").expect("Location", "/").expect(302, done);
  });
});

afterAll(async () => {
  await sequelize.sync({ force: true }); // 다 끝나고 db 초기화
});
