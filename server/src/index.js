const express = require("express");
const cors = require("cors");
const axios = require("axios");

const port = process.env.PORT || 8000;
const app = express();
app.use(cors());

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

app.listen(port, () => {
  console.log(`HTTP server listening on ${port}`);
});
