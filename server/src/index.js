const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongodb = require("mongodb");

const cfg = {
  httpPort: process.env.PORT || 8000,
  mongoURI: process.env.MONGO_URI || "mongodb://dev-country-picker-example:dev-country-picker-example@127.0.0.1:27017",
  mongoDBName: process.env.MONGO_DB_NAME || "dev-country-picker-example",
};

let startProms = [];

const app = express();
app.use(cors());

const mongoClient = new mongodb.MongoClient(cfg.mongoURI, { useUnifiedTopology: true });
let db = null;
startProms.push(
  mongoClient.connect().then(() => {
    db = mongoClient.db(cfg.mongoDBName);
  })
);

app.get("/api/v0/health", (req, res) => {
  res.json({
    ok: true,
  });
});

app.get("/api/v0/name/:query", async (req, res) => {
  const searchRes = await axios.get(`https://restcountries.eu/rest/v2/name/${req.params.query}`);
  if (searchRes.status !== 200) {
    console.warn(`Failed to search REST countries API, status=${searchRes.status}`);
    return res.json([]);
  }

  res.json(searchRes.data.slice(0, 5).map((r) => {
    return {
      name: r.name,
      flag: r.flag,
      saved: false,
    };
  }));
});

(async function() {
  try { 
    await Promise.all(startProms);
  } catch (e) {
    console.error("Failed to complete pre-start task:", e);
    return;
  }

  app.listen(cfg.httpPort, () => {
    console.log(`HTTP server listening on ${cfg.httpPort}`);
  });

  mongoClient.close();
})()
