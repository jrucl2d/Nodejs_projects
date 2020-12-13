const request = require("supertest");
const { sequelize } = require("../models");
const app = require("../app");

beforeAll(async () => {
  await sequelize.sync();
});

describe("POST /join", () => {
  test("로그인 안 했으면 가입", (done) => {
    request(app)
      .post("/auth/join")
      .send({
        email: "a@a",
        nick: "nodab",
        password: "123",
      })
      .expect("Location", "/")
      .expect(302, done); // async await이 아니면 done을 넣어서 마지막에 보내줘야 한다
  });
});

describe("POST /login", () => {
  const agent = request.agent(app);
  beforeEach((done) => {
    agent
      .post("/auth/login")
      .send({
        email: "a@a",
        password: "123",
      })
      .end(done);
  });
  test("이미 로그인 했으면 redirect / 수행", async (done) => {
    const message = encodeURIComponent("로그인 한 상태입니다");
    agent
      .post("/auth/login")
      .send({
        email: "a@a",
        nick: "nodab",
        password: "123",
      })
      .expect("Location", `/?error=${message}`)
      .expect(302, done);
  });
});

describe("POST /login", () => {
  test("가입되지 않은 회원", async (done) => {
    const message = encodeURIComponent("가입되지 않은 회원입니다");
    request(app)
      .post("/auth/login")
      .send({ email: "22a@a", password: "123" })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });
  test("로그인 수행", async (done) => {
    request(app)
      .post("/auth/login")
      .send({ email: "a@a", password: "123" })
      .expect("Location", "/") // redirect가 302 relocation이기 때문에
      .expect(302, done);
  });
  test("비밀번호가 틀림", async (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다");
    request(app)
      .post("/auth/login")
      .send({ email: "a@a", password: "12123413" })
      .expect("Location", `/?loginError=${message}`)
      .expect(302, done);
  });
});

describe("GET /logout", () => {
  // 로그아웃 오류 테스트
  test("로그인 되어 있지 않으면 403", async (done) => {
    request(app).get("/auth/logout").expect(403, done);
  });

  // 로그아웃 되는지 테스트하려면 로그인 시켜야 함
  const agent = request.agent(app); // agent로 만들면 그 상태가 뒤까지 유지됨.
  beforeEach((done) => {
    // beforeEach는 테스트 직전에 수행됨
    agent
      .post("/auth/login")
      .send({
        email: "a@a",
        password: "123",
      })
      .end(done);
  });

  test("로그아웃 수행", async (done) => {
    const message = encodeURIComponent("비밀번호가 일치하지 않습니다");
    agent.get("/auth/logout").expect("Location", "/").expect(302, done);
  });
});

// 두 번째 돌리면 이미 가입된 회원으로 다시 가입할려고 해서 오류 남.
// 끝에 force:true로 시퀄라이즈 싱크해주면 테이블 다시 만들기 때문에 이거 사용하면 됨
afterAll(async () => {
  await sequelize.sync({ force: true });
});
