const SUPPORTED_EVENTS = ["saveCountry", "removeSavedCountry"];

class PrimaryAPIOfflineError extends Error {
  constructor() {
    super("Primary API offline");
    this.name = "PrimaryAPIOfflineError";
  }
}

class APIClient {
  constructor() {
    // API URLs
    this.primaryAPIURL = `${window.location.protocol}//${window.location.host}/api/v0`;
    this.backupAPIURL = "https://restcountries.eu/rest/v2";

    // null = not checked, true = ok, false = failure
    this.primaryAPIOK = null;

    // Registered event handlers. Keys are event names. Values are arrays of callbacks.
    this.eventHandlers = {};
    SUPPORTED_EVENTS.forEach((e) => {
      this.eventHandlers[e] = [];
    });

    // Fallback list of saved countries
    this.fallbackSavedCountries = [];
  }

  /**
   * Make an API request. Handles API circuit breaker and error handling.
   * @param path {string} Path to request from API. Must start with a slash.
   * @param method {string} HTTP method, all capitals.
   * @param body {object} Body to be JSON encoded, optional.
   * @param primaryOnly {boolean} If true the request will only be attempted if the primary API is online.
   * @returns {Promise<FetchResponse>}
   * @throws {PrimaryAPIOfflineError} If primaryOnly is true and the primary API is offline.
   * @throws {string} If an unexpected error occurs.
   */
  async fetch(path, method, body, primaryOnly) {
    if (primaryOnly === undefined) {
      primaryOnly = false;
    }
    
    // Check if primary API is okay
    let activeAPIURL = this.primaryAPIURL;
    
    if (this.primaryAPIOK === null) {
      // Not checked yet
      let checkRes = null;
      try {
        checkRes = await fetch(this.primaryAPIURL + "/health");

        const checkJson = await checkRes.json();
        if (checkJson.ok === true) {
          this.primaryAPIOK = true;
        } else {
          this.primaryAPIOK = false;
        }
      } catch (e) {
        console.warn(`Failed to check primary API health`, e);
        this.primaryAPIOK = false;
        activeAPIURL = this.backupAPIURL;
      }
    }

    if (this.primaryAPIOK === false) {
      if (primaryOnly === true) {
        throw new PrimaryAPIOfflineError();
      }
      
      activeAPIURL = this.backupAPIURL;
    }

    // JSON encode body if required
    let reqBody = null;
    let reqHeaders = {};
    if (body !== undefined) {
      reqBody = JSON.stringify(body);
      reqHeaders["Content-Type"] = "application/json";
    }

    // Make request
    let res = null;
    try {
      res = await fetch(activeAPIURL + path, {
        method: method,
        headers: reqHeaders,
        body: reqBody,
      });
    } catch (e) {
      console.error(`Failed to make API request, activeAPIURL=${activeAPIURL}, path=${path}, method=${method}, body=${reqBody}`);

      // So we check if the primary API is okay
      this.primaryAPIOK = null;
      
      throw "Internal error";
    }
    
    return res;
  }

  /**
   * Register an event handler. Runs the callback when
   * the specified event occurs.
   * @param eventName {string} Name of event for which to run callback. Supported events are: "saveCountry" indicates a new country was saved, "removeSavedCountry" indicates a country was removed from the saved list.
   * @param callback {Function} Called whenever the event occurs. The function will be called with one argument which will be the data associated with the event. This differs based on the event: "saveCountry" the argument will be a Country object for the saved country, "removeSavedCountry" the argument will be the code of the country which was removed.
   * @throws {string} If the eventName is not supported.
   */
  on(eventName, callback) {
    if (SUPPORTED_EVENTS.indexOf(eventName) === -1) {
      throw `Event name "${eventName}" is not a supported event`;
    }

    this.eventHandlers[eventName].push(callback);
  }

  /**
   * For internal use only. Runs event handlers for 
   * the specified event.
   * @param eventName {string} Name of event to trigger.
   * @param argument {any} Value to pass to event handler callbacks as an argument.
   * @throws {string} If the eventName is not supported.
   */
  triggerEvent(eventName, argument) {
    if (SUPPORTED_EVENTS.indexOf(eventName) === -1) {
      throw `Event name "${eventName}" is not a supported event`;
    }

    this.eventHandlers[eventName].forEach((cb) => {
      cb(argument);
    });
  }

  /**
   * Search for a country by a, maybe partial, query.
   * @param query {string} Search query.
   * @returns {Promise<[]Country>} The top 5 matching countries.
   */
  async searchCountries(query) {
    const res = await this.fetch(`/name/${query}?fields=flag;name;alpha2Code`, "GET");
    if (res.status === 404) {
      return [];
    } else if (res.ok === false) {
      return [];
    }

    const body = await res.json();
    
    return body.slice(0, 5).map((r) => {
      return {
        flag: r.flag,
        name: r.name,
        code: r.code || r.alpha2Code,
        saved: (r.saved !== undefined && r.saved) || false,
      };
    });
  }

  /**
   * Save a country to the saved list.
   * @param code {Country} Country to save.
   * @returns {Promise} When saved.
   */
  async saveCountry(country) {
    try {
      const resp = await this.fetch(`/saved/${country.code}`, "POST", undefined, true);
      const body = await resp.json();
      this.triggerEvent("saveCountry", body.country);
    } catch (e) {
      if (e instanceof PrimaryAPIOfflineError) {
        // Use fallback list
        // Check if already saved
        const alreadySaved = this.fallbackSavedCountries.filter((c) => {
          return c.code === country.code;
        }).length > 0;
        if (alreadySaved === true) {
          return;
        }

        // Save
        const toSave = {
          ...country,
          saved: true
        };
        
        this.triggerEvent("saveCountry", toSave);
        this.fallbackSavedCountries.push(toSave);
      } else {
        // Propagate error
        throw e;
      }
    }
  }

  /**
   * Remove the country from the saved list.
   * @param code {string} Code of country to save.
   * @returns {Promise} When removed.
   */
  async removeSavedCountry(code) {
    try {
      await this.fetch(`/saved/${code}`, "DELETE", undefined, true);
      this.triggerEvent("removeSavedCountry", code);
    } catch (e) {
      if (e instanceof PrimaryAPIOfflineError) {
        // Use fallback list
        this.fallbackSavedCountries = this.fallbackSavedCountries.filter((c) => {
          return c.code !== code;
        });
        this.triggerEvent("removeSavedCountry", code);
      } else {
        // Propagate error
        throw e;
      }
    }
  }

  /**
   * Retrieve a list of all saved countries.
   * @returns {Promise<Country[]>} Array of saved countries.
   */
  async getSavedCountries() {
    try {
      const resp = await this.fetch("/saved", "GET", undefined, true);
      return await resp.json();
    } catch (e) {
      if (e instanceof PrimaryAPIOfflineError) {
        // Use fallback list
        return this.fallbackSavedCountries;
      } else {
        // Propagate error
        throw e;
      }
    }
  }
}

export default APIClient;
