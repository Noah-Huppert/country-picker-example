// Babel hack with Parcel to make async / await work
import 'regenerator-runtime/runtime';

import React from "react";
import ReactDOM from "react-dom";

import App from "./App.jsx";

ReactDOM.render(<App />, document.getElementById("app"));
