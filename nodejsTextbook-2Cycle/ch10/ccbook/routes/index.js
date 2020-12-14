const router = require("express").Router();
const axios = require("axios");

const URL = "http://localhost:8002/v1";
axios.defaults.headers.origin = "http://localhost:4000";

// 토큰 만료시 재발급받는 기능까지 추가되어 있는 미들웨어
const request = async (req, api) => {
  try {
    if (!req.session.jwt) {
      const tokenResult = await axios.post(`${URL}/token`, {
        serverSecret: process.env.SERVER_SECRET,
      });

      req.session.jwt = tokenResult.data.token; // 토큰 발급에 성공하면 세션에 저장
    }
    // 이후 원래 원하던 api 주소로 요청을 보냄
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    });
  } catch (err) {
    console.error(err);
    if (err.response.status === 419) {
      // 토큰 만료시
      delete req.session.jwt;
      return request(req, api); // 재귀 함수로 다시 발급
    }
    return err.response;
  }
};

router.get("/myPosts", async (req, res, next) => {
  try {
    const result = await request(req, "/posts/my");
    res.json(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/search/:hashtag", async (req, res, next) => {
  try {
    const result = await request(
      req,
      "/posts/hashtag/" + encodeURIComponent(req.params.hashtag)
    );
    res.json(result.data);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// router.get("/test", async (req, res, next) => {
//   try {
//     // 세션에 토큰이 없으면 토큰 발급 시도
//     if (!req.session.jwt) {
//       const tokenResult = await axios.post("http://localhost:8002/v1/token", {
//         serverSecret: process.env.SERVER_SECRET,
//       });
//       if (tokenResult.data && tokenResult.data.code === 200) {
//         req.session.jwt = tokenResult.data.token; // 토큰 발급에 성공하면 세션에 저장
//       } else {
//         return res.json(tokenResult.data); // 발급 실패 사유 전송
//       }
//     }
//     // 발급 받은 토큰을 테스트
//     const result = await axios.get("http://localhost:8002/v1/test", {
//       headers: { authorization: req.session.jwt },
//     });
//     return res.json(result.data);
//   } catch (err) {
//     if (err.response.status === 419) {
//       // 토큰 만료에 의한 에러면
//       return res.json(err.response.data);
//     }
//     console.error(err);
//     return next(err);
//   }
// });

module.exports = router;
