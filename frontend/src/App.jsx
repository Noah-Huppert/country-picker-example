import React from "react";

import APIClient from "./api.js";
import CountriesSearch from "./CountriesSearch.jsx";
import SavedCountriesList from "./SavedCountriesList.jsx";

const APICtx = React.createContext();

const App = () => {
  return (
    <>
      <APICtx.Provider value={new APIClient()}>
        <CountriesSearch />
        <SavedCountriesList />
      </APICtx.Provider>
    </>
  );
};

export default App;
export { APICtx };
