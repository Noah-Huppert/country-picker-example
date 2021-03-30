# Country Picker Example
Simple country picker frontend and backend.

# Table Of Contents
- [Overview](#overview)
- [Run](#run)
- [Development](#development)
  - [Frontend](#frontend)
  - [Server](#server)
- [Design](#design)
  - [Data Model](#data-model)
- [Credits](#credits)

# Overview
Example of a full stack application which allows the user to search for countries and save them to a list.

# Run
To run the application NodeJS and Yarn must be installed.

First install dependencies:

```
yarn install
```

Then build the frontend:

```
yarn build
```

Start the MongoDB server (Docker is required):

```
./server/containers-mongodb start
```

Then launch the server:

```
yarn start
```

# Development
## Frontend
The frontend is a ReactJS app built with Parcel.

Run a development server which builds and serves content:

```
yarn frontend-dev
```

Then navigate to [127.0.0.1:1234](http://127.0.0.1:1234).

## Server
The server is an ExpressJS REST API server.

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

Configuration values are provided via environment variables. The default values should work with the development setup by default:

- `PORT` (Integer, Default: `8000`): Port on which to listen for HTTP traffic
- `COUNTRY_PICKER_MONGO_URI` (String, Default: `mongodb://127.0.0.1:27017`): MongoDB connection URI
- `COUNTRY_PICKER_MONGO_DB_NAME` (String, Default: `dev-country-picker-example`): Name of the MongoDB database in which to store data

To run the server:

```
yarn start
```

# Design
## Data Model
**Country**:

- `name` (String, Required): Full capitalized country name
- `code` (String, Required): Short unique code for country
- `flag` (String, Required): URL to image of flag
- `saved` (Boolean, Required): If country is on the saved list

# Credits
The map icon used as the favicon and in the header is from [Icons8](https://icons8.com).
