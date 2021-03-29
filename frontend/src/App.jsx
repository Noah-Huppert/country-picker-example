import React from "react";

import APIClient from "./api.js";
import CountriesSearch from "./CountriesSearch.jsx";
import CountriesList from "./CountriesList.jsx";

const APICtx = React.createContext();

const App = () => {
  return (
    <>
      <APICtx.Provider value={new APIClient()}>
        <CountriesSearch />
        <CountriesList />
      </APICtx.Provider>
    </>
  );
};

export default App;
export { APICtx };
