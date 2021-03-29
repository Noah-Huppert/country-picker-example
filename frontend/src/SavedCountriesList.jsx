import React, {
  useState,
  useEffect,
  useContext,
} from "react";

import { APICtx } from "./App.jsx";
import CountryListItem from "./CountryListItem.jsx";

const SavedCountriesList = () => {
  const apiClient = useContext(APICtx);
  
  const [saved, setSaved] = useState([]);

  useEffect(async () => {
    // TODO: Add loading UI
    setSaved(await apiClient.getSavedCountries());
  }, []);
  
  return (
    <>
      {saved.map((c) => {
        return (
          <CountryListItem key={c.code} item={c} />
        );
      })}
    </>
  );
};

export default SavedCountriesList;
