import React, {
  useState,
  useEffect,
  useContext,
} from "react";
import styled from "styled-components";

import { APICtx } from "./App.jsx";
import CountryListItem from "./CountryListItem.jsx";

const SearchInput = styled.input`
width: 20rem;
margin-bottom: 0.5rem;
`;

const ResultsList = styled.div`

`;

const CountriesSearch = () => {
  const apiClient = useContext(APICtx);
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

  console.log("CountriesSearch, results=", results);

  useEffect(() => {
    // Ensure search results reflect saved status
    apiClient.on("saveCountry", (country) => {
      setResults((results) => {
        return results.map((r) => {
          if (r.code === country.code) {
            return country;
          }

          return r;
        });
      });
    });

    apiClient.on("removeSavedCountry", (code) => {
      setResults((results) => {
        return results.map((r) => {
          if (r.code === code) {
            r.saved = false;
          }

          return r;
        });
      });
    });
  }, []);

  useEffect(async () => {
    if (query.length === 0) {
      setResults([]);
    } else {
      // Ensure we don't spam the search endpoint while
      // the user is typing.
      clearTimeout(searchTimeout);
      setSearchTimeout(setTimeout(async () => {
        // TODO: Add loading UI element
        // TODO: No results UI
        setResults(await apiClient.searchCountries(query));
      }, 200));
    }
  }, [query]);
  
  const onQueryChange = async (e) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <h1>Add Countries</h1>
      <SearchInput
        type="text"
        value={query}
        onChange={onQueryChange} />

      <ResultsList>
        {results.map((item) => {
          return (
            <CountryListItem
              key={item.code}
              item={item}
            />
          );
        })}
      </ResultsList>
    </>
  );
};

export default CountriesSearch;
