const http = require("http");
const fs = require("fs");

const users = {};

http
  .createServer((req, res) => {
    // GET 방식으로 클라이언트가 서버로부터 정보를 받아감
    // 1: '/' 과 '/about'은 페이지를 요청하는 것 -> HTML파일을 전송
    // 2: '/users'에서는 AJAX 요청하는 것 -> users 데이터를 전송
    // 3: 그 외는 CSS또는 JS파일 요청이므로 찾아서 보내줌. 없다면 404 NOT FOUND 에러
    if (req.method === "GET") {
      // 1번
      if (req.url === "/") {
        return fs.readFile("./restFront.html", (err, data) => {
          if (err) {
            throw err;
          }
          res.end(data);
        });
      } else if (req.url === "/about") {
        return fs.readFile("./about.html", (err, data) => {
          if (err) {
            throw err;
          }
          console.log("About clicked");
          res.end(data);
        });
      }
      // 2번
      else if (req.url === "/users") {
        return res.end(JSON.stringify(users));
      }
      // 3번
      return fs.readFile(`.${req.url}`, (err, data) => {
        if (err) {
          res.writeHead(404, "NOT FOUND");
          return res.end("NOT FOUND");
        }
        return res.end(data);
      });
    }
    // POST 방식으로 서버에 새 데이터를 추가
    else if (req.method === "POST") {
      if (req.url == "/users") {
        // front에서 send 시에 /users url로 데이터를 보냈다. 받은 데이터를 body에 써나간다.
        let body = "";
        req.on("data", (data) => {
          body += data;
        });
        // 모두 읽은 데이터를 end시에 저장한다.
        return req.on("end", () => {
          console.log(`POST 본문(Body):`, body);
          const { name } = JSON.parse(body); // string 형태이므로 parse 과정이 필요
          const id = Date.now();
          users[id] = name;
          res.writeHead(201);
          res.end("등록 성공");
        });
      }
    }
    // PUT 방식으로 서버의 기존 데이터를 새 데이터로 갱신
    else if (req.method === "PUT") {
      if (req.url.startsWith("/users/")) {
        const key = req.url.split("/")[2]; // users/ 뒤의 내용임. front에서 users/뒤에 키를 붙여서 보냈었음
        let body = "";
        req.on("data", (data) => {
          body += data;
        });
        return req.on("end", () => {
          console.log("PUT 본문(Body) :", body);
          users[key] = JSON.parse(body).name;
          return res.end(JSON.stringify(users));
        });
      }
    }
    // DELETE 방식으로 서버의 데이터를 삭제
    else if (req.method === "DELETE") {
      if (req.url.startsWith("/users/")) {
        const key = req.url.split("/")[2];
        delete users[key];
        return res.end(JSON.stringify(users));
      }
    }
    res.writeHead(404, "NOT FOUND"); // 위의 어느것에도 해당이 안 되면 오류
    return res.end("NOT FOUND");
  })
  .listen(8080, () => {
    console.log("running!!");
  });
