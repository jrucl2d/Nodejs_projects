const express = require("express");
const axios = require("axios");
const router = express.Router();

// const URL = "http://localhost:8002/v1";
const URL = "http://localhost:8002/v2"; // v1은 deprecated되었고, v2 API 라우터를 사용
// 요청이 어디서 왔는지 origin 보고 판단. 브라우저에서 서버로 보내면 알아서 넣어주지만 서버에서 서버로 보낼 때는 직접 넣어주는게 좋다.
axios.defaults.headers.origin = "http://localhost:8003";

// 토큰 발급, 재발급 혹은 오류 리턴 부분을 함수로 만들었음
const request = async (req, api) => {
  try {
    if (!req.session.jwt) {
      // session 내에 토큰 없으면 토큰 발급 시도
      const tokenResult = await axios.post(`${URL}/token`, {
        frontSecret: process.env.FRONT_SECRET,
      });
      req.session.jwt = tokenResult.data.token; // 세션에 토큰을 저장
    }
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    }); // API 요청 보냄
  } catch (err) {
    console.error(err);
    if (err.response.status === 419) {
      // token 만료되면 기존 세션의 토큰 삭제 후 재요청
      delete req.session.jwt;
      return request(req.api);
    }
    return err.response; // 이외의 에러는 해당 response를 리턴
  }
};
router.get("/", (req, res, next) => {
  res.render("main", { key: process.env.FRONT_SECRET });
});

router.get("/mypost", async (req, res, next) => {
  try {
    const result = await request(req, "/posts/my");
    return res.json(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.get("/search/:hashtag", async (req, res, next) => {
  try {
    const result = await request(
      req,
      `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`
    );
    return res.json(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});
router.get("/follow", async (req, res, next) => {
  try {
    const result = await request(req, "/follow");
    return res.send(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/test", async (req, res, next) => {
  try {
    const result = await request(req, "/test");
    return res.json(result.data);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

module.exports = router;
