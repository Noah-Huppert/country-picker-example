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

    // Update this part of the UI when something is added
    // or removed
    apiClient.on("saveCountry", (country) => {
      setSaved((saved) => {
        let n = [...saved];
        n.push(country);

        return n;
      });
    });

    apiClient.on("removeSavedCountry", (code) => {
      setSaved((saved) => {
        return saved.filter((c) => {
          return c.code !== code;
        });
      });
    });
  }, []);
  
  return (
    <>
      <h1>Saved Countries</h1>
      {saved.map((c) => {
        return (
          <CountryListItem key={c.code} item={c} />
        );
      })}
    </>
  );
};

export default SavedCountriesList;