const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");

const parseCookies = (cookie = "") =>
  cookie
    .split(";")
    .map((v) => v.split("="))
    .map(([k, ...vs]) => [k, vs.join("=")])
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});

http
  .createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    if (req.url.startsWith("/login")) {
      console.log(req.url);
      const { query } = url.parse(req.url); // 요청의 url을 분해( protocol, auth query등 속성이 존재)
      const { name } = qs.parse(query); // {query}.query, 즉 객체 안의 query를 자바스크립트 객체로 분해
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5); // 쿠키의 유효기간 5분으로 설정
      res.writeHead(302, {
        Location: "/", // 리다이렉트 주소
        "Set-Cookie": `name=${encodeURIComponent(name)};Expires=${expires.toString()}HttpOnly; Path=/`,
      });
      res.end();
    } else if (cookies.name) {
      // 로그인 폼 전송 후에는 쿠키가 존재하므로 이 곳으로 옴
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }); // 한글 문제를 해결하기 위해 인코딩 명시
      res.end(`${cookies.name}님 안녕하세요`);
    } else {
      fs.readFile("./server4.html", (err, data) => {
        if (err) {
          throw err;
        }
        res.end(data);
      });
    }
  })
  .listen(8080, () => {
    console.log("running!");
  }); // Application 탭에서 쿠키를 확인할 수 있는 문제가 존재
