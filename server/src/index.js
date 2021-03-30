const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const mongodb = require("mongodb");
const path = require("path");

const CFG = {
  httpPort: process.env.PORT || 8000,
  mongoURI: process.env.COUNTRY_PICKER_MONGO_URI || "mongodb://127.0.0.1:27017",
  mongoDBName: process.env.COUNTRY_PICKER_MONGO_DB_NAME || "dev-country-picker-example",
};


const CUSTOM_COUNTRIES = [
  {
    name: "Antegria",
    code: "CUSTOM_AG",
    flag: "/public/custom_ag.png",
  },
  {
    name: "Arstotzka",
    code: "CUSTOM_AZ",
    flag: "/public/custom_az.png",
  },
  {
    name: "Atlantis",
    code: "CUSTOM_AT",
    flag: "/public/custom_at.png",
  },
  {
    name: "Canada",
    code: "CA",
    flag: "/public/custom_ca.png",
  },
  {
    name: "Grenyarnia",
    code: "CUSTOM_GN",
    flag: "/public/custom_gn.png",
  },
  {
    name: "Narnia",
    code: "CUSTOM_NR",
    flag: "/public/custom_nr.svg",
  },
  {
    name: "Qumar",
    code: "CUSTOM_QR",
    flag: "/public/custom_qr.png",
  },
  {
    name: "Yoshi's Island",
    code: "CUSTOM_YI",
    flag: "/public/custom_yi.png",
  },
];

/**
 * All promises in this array will be completed before
 * the HTTP server starts.
 */
let startProms = [];

// Connect to Mongo
const mongoClient = new mongodb.MongoClient(CFG.mongoURI,{ useUnifiedTopology: true });
let db = null;
let dbSavedCountries = null;

startProms.push(
  mongoClient.connect().then(() => {
    db = mongoClient.db(CFG.mongoDBName);
    dbSavedCountries = db.collection("saved_countries");
  })
);

// Setup HTTP server
const app = express();
app.use((req, res, next) => {
  next();

  console.log(`${req.method} ${req.path} => ${res.statusCode}`);
});
app.use(cors());

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../../dist")));
app.use(bodyParser.json());

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
 * Response Country[]
 */
app.get("/api/v0/name/:query", async (req, res) => {
  let query = req.params.query.toLowerCase();
  let matches = [];
  let customMatchCodes = [];

    // Check custom countries
  CUSTOM_COUNTRIES.filter((c) => {
    return c.name.toLowerCase().indexOf(query) !== -1;
  }).forEach((c) => {
    matches.push(c);
    customMatchCodes.push(c.code.toLowerCase());
  });

  // Search external source for countries
  try {
    let externRes = await axios.get(`https://restcountries.eu/rest/v2/name/${query}?fields=flag;name;alpha2Code`);

    externRes.data.slice(0, 5).forEach((r) => {
      // Check a custom country hasn't overriden this result
      if (customMatchCodes.indexOf(r.alpha2Code.toLowerCase()) !== -1) {
        // Avoid overwriting custom entry
        return;
      }
      
      matches.push({
        name: r.name,
        code: r.alpha2Code,
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

  // Ensure returning no more than 5
  matches = matches.slice(0, 5);

  // Ensure all country codes are lowercase
  matches = matches.map((c) => {
    c.code = c.code.toLowerCase();
    return c;
  })

  // Get saved status
  const matchCodes = matches.map((m) => {
    return m.code;
  });
  const savedMatchCodes = (await dbSavedCountries.find({
    code: {
      $in: matchCodes,
    },
  }).toArray()).map((c) => {
    return c.code;
  });
  
  matches = matches.map((m) => {
    return {
      ...m,
      saved: savedMatchCodes.indexOf(m.code) !== -1,
    };
  });

  return res.json(matches);
});

/**
 * Marks a country as saved.
 * Request: URL parameter code is the code of the country to save.
 * Response: { country: Country }
 */
app.post("/api/v0/saved/:code", async (req, res) => {
  const code = req.params.code.toLowerCase();
  let country = null;

  // Check if custom country
  let customCountry = CUSTOM_COUNTRIES.filter((c) => {
    return c.code.toLowerCase() === code;
  });
  if (customCountry.length === 1) {
    country = customCountry[0];
  }

  // If not custom country query external API
  if (country === null) {
    try {
      const res = await axios.get(`https://restcountries.eu/rest/v2/alpha/${code}?fields=flag;name`);
      country = {
        name: res.data.name,
        code: code,
        flag: res.data.flag,
      };
    } catch (e) {
      // Not found
      if (e.response.status === 404) {
        return res.status(404).json({
          error: `Could not find country with code "${code}"`,
        });
      }

      // Other error
      console.error(`Failed to query external API for country with code=${code} for saving`);
      return res.status(500).json({
        error: `Failed to find country with code "${code}"`,
      });
    }
  }

  // country will not be null here
  country.code = country.code.toLowerCase();

  try {
    await dbSavedCountries.updateOne(
      { code: code },
      { $set: country },
      { upsert: true }
    );
  } catch (e) {
    console.error(`Failed to saved country "${code}": ${e}`);
    return res.status(500).json({
      error: "Failed to save country",
    });
  }

  return res.json({
    country: {
      ...country,
      saved: true,
    },
  });
});

/**
 * Remove a saved country from the list.
 * Request: URL parameter code is the code of the country to delete.
 * Response: { deleted_country_code: string }
 */
app.delete("/api/v0/saved/:code", async (req, res) => {
  const code = req.params.code.toLowerCase();

  // Delete
  try {
    await dbSavedCountries.deleteOne({ code: code });
  } catch (e) {
    console.error(`Failed to delete country "${code}": ${e}`);
    return res.status(500).json({
      error: `Failed to delete country with code "${code}"`,
    });
  }

  return res.json({
    deleted_country_code: code,
  });
});

/**
 * Retrieves all saved countries.
 * Request: N/A
 * Response: Country[]
 */
app.get("/api/v0/saved", async (req, res) => {
  let countries = [];

  // Get from database
  try {
    countries = await dbSavedCountries.find({}).toArray();
  } catch (e) {
    console.error(`Failed to retrieve list of saved countries: ${e}`);
    return res.status(500).json({
      error: "Failed to retrieve list of saved countries",
    });
  }

  // Add saved field
  countries = countries.map((c) => {
    return {
      ...c,
      saved: true,
    };
  });

  return res.json(countries);
});

/**
 * Runs express app listen(), which blocks until the
 * server closes.
 * @returns {Promise} Resolves when server closes.
 */
async function httpListen() {
  console.log(`Starting HTTP server on :${CFG.httpPort}`);
  await new Promise((resolve, reject) => {
    app.listen(CFG.httpPort, (err) => {
      if (err !== undefined) {
        reject(err);
      }
      console.log(`HTTP server listening on :${CFG.httpPort}`);
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
