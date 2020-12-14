const router = require("express").Router();
const axios = require("axios");

router.get("/test", async (req, res, next) => {
  try {
    // 세션에 토큰이 없으면 토큰 발급 시도
    if (!req.session.jwt) {
      const tokenResult = await axios.post("http://localhost:8002/v1/token", {
        serverSecret: process.env.SERVER_SECRET,
      });
      if (tokenResult.data && tokenResult.data.code === 200) {
        req.session.jwt = tokenResult.data.token; // 토큰 발급에 성공하면 세션에 저장
      } else {
        return res.json(tokenResult.data); // 발급 실패 사유 전송
      }
    }
    // 발급 받은 토큰을 테스트
    const result = await axios.get("http://localhost:8002/v1/test", {
      headers: { authorization: req.session.jwt },
    });
    return res.json(result.data);
  } catch (err) {
    if (err.response.status === 419) {
      // 토큰 만료에 의한 에러면
      return res.json(err.response.data);
    }
    console.error(err);
    return next(err);
  }
});

module.exports = router;
