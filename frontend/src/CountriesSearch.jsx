import React, {
  useState,
  useEffect,
  useContext,
} from "react";
import styled from "styled-components";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import { APICtx } from "./App.jsx";
import CountryListItem from "./CountryListItem.jsx";

const SearchInput = styled(Form.Control)`
width: 20rem;
margin-bottom: 0.5rem;
`;

const ResultsList = styled.div`

`;

const SearchLoading = styled.div`
width: 100%;
display: flex;
align-items: center;
margin-left: 1rem;
`;

const SearchLoadingText = styled.div`
font-size: 1.5rem;
font-weight: bold;
margin-left: 1rem;
`;

const CountriesSearch = () => {
  const apiClient = useContext(APICtx);
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

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
      setLoading(true);
      // Ensure we don't spam the search endpoint while
      // the user is typing.
      clearTimeout(searchTimeout);
      setSearchTimeout(setTimeout(async () => {
        // TODO: No results UI
        setResults(await apiClient.searchCountries(query));
        setLoading(false);
      }, 200));
    }
  }, [query]);

  const onSearchFormSubmit = (e) => {
    e.preventDefault();
  };
  
  const onQueryChange = async (e) => {
    setQuery(e.target.value);
  };

  return (
    <>
      <Form onSubmit={onSearchFormSubmit}>
        <Form.Group controlId="contriesSearch">
          <SearchInput
            type="text"
            placeholder="Search for a country"
            value={query}
            onChange={onQueryChange} />
        </Form.Group>
      </Form>

      <ResultsList>
        {loading === true && (
          <SearchLoading className="text-light">
            <Spinner
              animation="border"
            />
            <SearchLoadingText>
              Searching...
            </SearchLoadingText>
          </SearchLoading>
        ) || results.map((item) => {
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
