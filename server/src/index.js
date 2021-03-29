const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongodb = require("mongodb");

const CUSTOM_COUNTRIES = [
  {
    name: "Antegria",
    flag: "https://static.wikia.nocookie.net/papersplease/images/4/47/Antegria_emblem.png",
  },
  {
    name: "Arstotzka",
    flag: "https://i.imgur.com/gMszxk1.png",
  },
  {
    name: "Atlantis",
    flag: "https://i.imgur.com/ddprV9V.png",
  },
  {
    name: "Canada",
    flag: "https://i.imgur.com/O6oEdxf.png",
  },
  {
    name: "Grenyarnia",
    flag: "https://static.wikia.nocookie.net/orbis-novus",
  },
];

const cfg = {
  httpPort: process.env.PORT || 8000,
  mongoURI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
  mongoDBName: process.env.MONGO_DB_NAME || "dev-country-picker-example",
};

/**
 * All promises in this array will be completed before
 * the HTTP server starts.
 */
let startProms = [];

// Connect to Mongo
const mongoClient = new mongodb.MongoClient(cfg.mongoURI,{ useUnifiedTopology: true });
let db = null;

startProms.push(
  mongoClient.connect().then(() => {
    db = mongoClient.db(cfg.mongoDBName);
  })
);

// Setup HTTP server
const app = express();
app.use(cors());

/**
 * Health check endpoint.
 * Response: { ok: bool }
 */
app.get("/api/v0/health", (req, res) => {
  res.json({
    ok: true,
  });
});

/**
 * Search for country by name.
 * Request: URL parameter is a partial query.
 * Response { flag: string, name: string, saved: bool }[]
 */
app.get("/api/v0/name/:query", async (req, res) => {
  let query = req.params.query.toLowerCase();
  let matches = [];
  
  // Search external source for countries
  try {
    let externRes = await axios.get(`https://restcountries.eu/rest/v2/name/${query}?fields=flag;name`);

    externRes.data.slice(0, 5).forEach((r) => {
      matches.push({
        name: r.name,
        flag: r.flag,
      });
    });
  } catch (e) {
    if (e.response.status === 404) {
      // This is okay, means no matches for query
    } else {
      console.error(`Failed to search external countries service: ${e}`);
    }
  }

  // Check custom countries
  CUSTOM_COUNTRIES.filter((c) => {
    return c.name.toLowerCase().indexOf(query) !== -1;
  }).forEach((c) => {
    matches.push(c);
  });

  // Ensure returning no more than 5
  matches = matches.slice(0, 5);

  // Add saved status
  matches = matches.map((m) => {
    return {
      ...m,
      saved: false,
    };
  });

  return res.json(matches);
});

/**
 * Runs express app listen(), which blocks until the
 * server closes.
 * @returns {Promise} Resolves when server closes.
 */
async function httpListen() {
  console.log(`Starting HTTP server on ${cfg.httpPort}`);
  await new Promise((resolve, reject) => {
    app.listen(cfg.httpPort, (err) => {
      if (err !== undefined) {
        reject(err);
      }
      console.log(`HTTP server listening on ${cfg.httpPort}`);
    });
  });
}

/** 
 * Sets up the API server and runs it.
 * Completes al promises in startProms first.
 * @returns {number} Process exit code.
 */
async function main() {
  // First complete all setup tasks
  try { 
    await Promise.all(startProms);
  } catch (e) {
    console.error(`Failed to complete pre-start task: ${e}`);
    return 1;
  }

  // Run HTTP server until it closes
  try {
    await httpListen();
  } catch (e) {
    console.error(`Failed to run HTTP server: ${e}`);
    return 1;
  }

  // Cleanup
  mongoClient.close();

  return 0;
}

main().then((code) => {
  process.exit(code)
});
