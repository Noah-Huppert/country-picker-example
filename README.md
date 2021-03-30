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

## Install Dependencies
First install dependencies:

```
yarn install
```

## Build Frontend
Then build the frontend using Parcel:

```
yarn build
```

## Start MongoDB
Start the MongoDB server in a Docker container:

```
./server/containers-mongodb start
```

This starts MongoDB with an admin user named `devuser` with a password of `devpassword` on `127.0.0.1:27017`.

If you use a Docker compatible alternative (Like Podman) set the `CONTAINER_CLI` environment variable to make the `containers-mongodb` script use your container CLI.

## Configuration
Configuration values are provided via environment variables. The default values should work with the development setup by default:

- `PORT` (Integer, Default: `8000`): Port on which to listen for HTTP traffic
- `COUNTRY_PICKER_MONGO_URI` (String, Default: `mongodb://devuser:devpassword@127.0.0.1:27017`): MongoDB connection URI
- `COUNTRY_PICKER_MONGO_DB_NAME` (String, Default: `dev-country-picker-example`): Name of the MongoDB database in which to store data

## Run Server
Then launch the server:

```
yarn start
```

# Development
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
- `POST /api/v0/saved/{code}`: Saves a country
  - Request: URL parameter `{code}` must be the code of the country one wishes to save
  - Response: The country which was saved - `{ country: Country }`
- `DELETE /api/v0/saved/{code}`: Removes a saved country
  - Request: URL parameter `{code}` must be the code of the country one wishes to remove from the saved list
  - Response: The code of the country which was successfully deleted - `{ deleted_country_code: string }`

To run the server:

```
yarn start
```

By default the server will be accessible at [127.0.0.1:8000](http://127.0.0.1:8000). If you configured a different port, use that instead of `8000`.

## Frontend
The frontend is a ReactJS app built with Parcel.

Run a development server which builds and serves content:

```
yarn frontend-dev
```

Ignore the terminal output which says to view the build result at `127.0.0.1:1234` and view the result at whatever URL the server is running on. The frontend will only work if it served by the backend server.

# Design
## Data Model
**Country**:

- `name` (String, Required): Full capitalized country name
- `code` (String, Required): Short unique code for country
- `flag` (String, Required): URL to image of flag
- `saved` (Boolean, Required): If country is on the saved list (not stored in database as a document's existence in the database indicates `saved = true`)

# Credits
The map icon used as the favicon and in the header is from [Icons8](https://icons8.com).
