import React, {
  useState,
  useEffect,
  useContext,
} from "react";
import styled from "styled-components";
import Spinner from "react-bootstrap/Spinner";

import { APICtx } from "./App.jsx";
import CountryListItem from "./CountryListItem.jsx";

const Loading = styled.div`
width: 100%;
display: flex;
align-items: center;
margin-left: 1rem;
`;
const LoadingText = styled.div`
font-size: 1.5rem;
font-weight: bold;
margin-left: 1rem;
`;

const SavedCountriesList = () => {
  const apiClient = useContext(APICtx);
  
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    setSaved(await apiClient.getSavedCountries());
    setLoading(false);

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
      {loading === true && (
        <Loading className="text-light">
          <Spinner
            animation="border"
          />
          <LoadingText>
            Loading...
          </LoadingText>
        </Loading>
      ) || saved.map((c) => {
        return (
          <CountryListItem key={c.code} item={c} />
        );
      })}
    </>
  );
};

export default SavedCountriesList;
