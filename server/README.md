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
  - Response: `{ ok: bool }`
- `GET /api/v0/name/{name}`: Searches for a country by name
  - Request: URL parameter `{name}` must be a string country name query
  - Response: `{ image: string, name: string, saved: bool }[]`

# Run
Install NodeJS dependencies:

```
yarn install
```

Run the server:

```
yarn start
```
