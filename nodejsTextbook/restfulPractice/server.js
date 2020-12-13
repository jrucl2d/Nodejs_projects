const http = require("http");
const fs = require("fs").promises;
const PORT = process.env.PORT || 8080;

let users = {};

const server = http.createServer(async (req, res) => {
  try {
    // GET 메소드
    if (req.method === "GET") {
      if (req.url === "/") {
        const data = await fs.readFile("./index.html");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(data);
      } else if (req.url === "/about") {
        const data = await fs.readFile("./about.html");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(data);
      } else if (req.url === "/user") {
        res.writeHead(200, {
          "Content-Type": "aplication/json; charset=utf-8",
        });
        return res.end(JSON.stringify(users));
      } else {
        try {
          // css 또는 js 파일 전송
          const data = await fs.readFile(`.${req.url}`);
          return res.end(data);
        } catch (err) {
          console.error(err);
          res.writeHead(404);
          return res.end("NOT FOUND");
        }
      }
    }
    // POST 메소드
    else if (req.method === "POST") {
      if (req.url === "/user") {
        let body = "";
        req.on("data", (data) => (body += data));
        return req.on("end", () => {
          const { name } = JSON.parse(body);
          const id = Date.now();
          users[id] = name;
          console.log(`새로운 유저 추가됨! ${name}`);
          res.writeHead(201, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end("ok");
        });
      }
    } else if (req.method === "PUT") {
      if (req.url.startsWith("/user/")) {
        const modifyID = req.url.split("/")[2];
        let body = "";
        req.on("data", (data) => (body += data));
        return req.on("end", () => {
          const { newName } = JSON.parse(body);
          users[modifyID] = newName;
          console.log(users);
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          return res.end("ok");
        });
      }
    } else if (req.method === "DELETE") {
      if (req.url.startsWith("/user/")) {
        const delID = req.url.split("/")[2];
        delete users[delID];
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        return res.end("ok");
      }
    }
    res.writeHead(404);
    return res.end("NOT FOUND");
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(err.message);
  }
});
server.listen(PORT, () => {
  console.log(`포트 번호 ${PORT}에서 서버 동작중`);
});
