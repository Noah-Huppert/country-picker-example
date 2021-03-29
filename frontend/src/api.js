class APIClient {
  constructor() {
    this.primaryAPIURL = "http://127.0.0.1:8000/api/v0";
    this.backupAPIURL = "https://restcountries.eu/rest/v2";

    // null = not checked, true = ok, false = failure
    this.primaryAPIOK = null;
  }

  /**
   * Make an API request. Handles API circuit breaker and error handling.
   * @param path {string} Path to request from API. Must start with a slash.
   * @param method {string} HTTP method, all capitals.
   * @param body {object} Body to be JSON encoded, optional.
   * @returns {Promise<FetchResponse>}
   */
  async fetch(path, method, body) {
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
    } else if (this.primaryAPIOK === false) {
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
   * Search for a country by a, maybe partial, query.
   * @param query {string} Search query.
   * @returns {Promise<[]Country>} The top 5 matching countries.
   */
  async searchCountries(query) {
    const res = await this.fetch(`/name/${query}?fields=flag;name`, "GET");
    if (res.ok === false) {
      return [];
    }

    const body = await res.json();
    
    return body.slice(0, 5).map((r) => {
      return {
        flag: r.flag,
        name: r.name,
        saved: r.saved || false,
      };
    });
  }
}

export default APIClient;
