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

  useEffect(async () => {
    if (query.length === 0) {
      setResults([]);
    } else {
      // Ensure we don't spam the search endpoint while
      // the user is typing.
      clearTimeout(searchTimeout);
      setSearchTimeout(setTimeout(async () => {
        setResults(await apiClient.searchCountries(query));
      }, 200));
    }
  }, [query]);
  
  const onQueryChange = async (e) => {
    setQuery(e.target.value);
  };

  return (
    <>
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
