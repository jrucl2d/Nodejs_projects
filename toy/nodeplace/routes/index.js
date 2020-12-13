const express = require("express");
const util = require("util");
const googleMaps = require("@google/maps");

const History = require("../schemas/history");
const Favorite = require("../schemas/favorite");
const router = express.Router();

const googleMapsClient = googleMaps.createClient({
  key: process.env.PLACES_API_KEY,
});

router.get("/", async (req, res, next) => {
  try {
    const favorites = await Favorite.find({});
    const history = await History.find({}).limit(5).sort("-createdAt"); // 최근 검색내역 5개 불러오기
    res.render("index", { results: favorites, history });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// font에서 받은 자동완성 get 요청을 다시 구글 API 서버로 보냄
router.get("/autocomplete/:query", (req, res, next) => {
  googleMapsClient.placesQueryAutoComplete(
    {
      input: req.params.query,
      language: "ko",
    },
    (err, response) => {
      if (err) {
        return next(err);
      }
      return res.json(response.json.predictions);
    }
  );
});

router.get("/search/:query", async (req, res, next) => {
  const googlePlaces = util.promisify(googleMapsClient.places);
  const googlePlacesNearBy = util.promisify(googleMapsClient.placesNearby);
  const { lat, lng, type } = req.query;
  try {
    const history = await History.find({}).limit(5).sort("-createdAt"); // 최근 검색내역 5개 불러오기
    await History.create({
      query: req.params.query,
    });
    let response;
    if (lat && lng) {
      response = await googlePlacesNearBy({
        keyword: req.params.query,
        location: `${lat}, ${lng}`,
        rankby: "distance",
        language: "ko",
        type,
      });
    } else {
      response = await googlePlaces({
        query: req.params.query,
        language: "ko",
        type,
      });
    }
    res.render("result", {
      title: `${req.params.query} 검색 결과`,
      results: response.json.results,
      query: req.params.query,
      history,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post("/location/:id/favorite", async (req, res, next) => {
  try {
    const favorite = await Favorite.create({
      placeId: req.params.id,
      name: req.body.name,
      location: [req.body.lng, req.body.lat], // 몽고 디비에는 경도, 위도 순으로 저장한다.
    });
    res.send(favorite);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete("/location/:id/favorite", async (req, res, next) => {
  try {
    await Favorite.remove({
      placeId: req.params.id,
    });
    res.send("yes");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
