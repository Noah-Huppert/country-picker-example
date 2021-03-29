# Country Picker Example
Simple country picker frontend and backend.

# Table Of Contents
- [Overview](#overview)
- [Design](#design)
  - [Data Model](#data-model)

# Overview
Example of a full stack application which allows the user to search for a countries and save them to a list.

See the [`./frontend`](./frontend) and [`./server`](./server) directories for more information.

# Design
## Data Model
**Country**:

- `name` (String, Required): Full capitalized country name
- `code` (String, Required): Short unique code for country
- `flag` (String, Required): URL to image of flag
- `saved` (Boolean, Required): If country is on the saved list
