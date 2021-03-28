import React, { useState } from "react";
import styled from "styled-components";

import CountryListItem from "./CountryListItem.jsx";

const SearchInput = styled.input`
width: 20rem;
margin-bottom: 0.5rem;
`;

const ResultsList = styled.div`

`;

function dummyResults(seed) {
  let fakeRes = [];
  for (var i = 0; i < 5; i++) {
    fakeRes.push({
      image: "https://i.redd.it/sdle64fbox101.png",
      name: `${seed}-${i}`,
      saved: false,
    });
  }

  return fakeRes;
}

const CountriesSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(dummyResults("null"));
  
  const onQueryChange = (e) => {
    setQuery(e.target.value);

    // dummy results
    setResults(dummyResults(e.target.value));
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
              key={item.name}
              item={item}
            />
          );
        })}
      </ResultsList>
    </>
  );
};

export default CountriesSearch;
