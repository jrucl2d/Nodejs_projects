const express = require("express");
const axios = require("axios");
const router = express.Router();
const URL = "http://localhost:8001/v2";

axios.defaults.headers.origin = "http://localhost:8002"; // add origin header

const request = async (req, api) => {
  try {
    // if there's no token, generate token
    if (!req.session.jwt) {
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      req.session.jwt = tokenResult.data.token; // save token to session
    }
    return await axios.get(`${URL}${api}`, {
      headers: { authorization: req.session.jwt },
    });
  } catch (err) {
    if (err.response.status === 419) {
      // if token is expired, regenerate token
      delete req.session.jwt;
      return request(req, api);
    }
    return err.response;
  }
};

router.get("/mypost", async (req, res, next) => {
  try {
    const result = await request(req, "/posts/my"); // get my posts from API
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
      `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`
    );
    res.json(result.data);
  } catch (err) {
    if (err.code) {
      console.error(err);
      next(err);
    }
  }
});

router.get("/", (req, res) => {
  res.render("main", { key: process.env.CLIENT_SECRET });
});

module.exports = router;
