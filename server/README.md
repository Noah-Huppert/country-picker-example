# Server
REST API server.

# Table Of Contents
- [Overview](#overview)
- [Run](#run)

# Overview
ExpressJS REST API server.

Endpoints:

- `GET /api/v0/health`: Indicates if server is running correctly
  - Request: N/A
  - Response: `ok` indicates if the server is working - `{ ok: bool }`
- `GET /api/v0/name/{name}`: Searches for a country by name
  - Request: URL parameter `{name}` must be a string country name query
  - Response: All matching countries - `Country[]`
- `GET /api/v0/saved`: Retrieves a list of all saved countries
  - Request: N/A
  - Response: All saved countries - `Country[]`
- `POST /api/v0/saved/{code}`
  - Request: URL parameter `{code}` must be the code of the country one wishes to save
  - Response: The country which was saved - `{ country: Country }`
- `DELETE /api/v0/saved/{code}`
  - Request: URL parameter `{code}` must be the code of the country one wishes to remove from the saved list
  - Response: The code of the country which was successfully deleted - `{ deleted_country_code: string }`

# Run
Install NodeJS dependencies:

```
yarn install
```

Set configuration environment variables:

- `COUNTRY_PICKER_EXTERNAL_URL` (String, Default: `http://127.0.0.1:8000`): The URL from which web browsers should be able to access the server. Must not end in a slash.
- `PORT` (Integer, Default: `8000`): Port on which to listen for HTTP traffic
- `COUNTRY_PICKER_MONGO_URI` (String, Default: `mongodb://127.0.0.1:27017`): MongoDB connection URI
- `COUNTRY_PICKER_MONGO_DB_NAME` (String, Default: `dev-country-picker-example`): Name of the MongoDB database in which to store data

Run the server:

```
yarn start
```
