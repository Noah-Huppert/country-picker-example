import React, {
  useState,
  useContext,
} from "react";
import styled from "styled-components";

import { APICtx } from "./App.jsx";

const Item = styled.div`
max-width: 20rem;
display: flex;
border: 1px solid black;
padding: 1rem;
margin-bottom: 0.5rem;
`;

const FlagImg = styled.img`
max-height: 1rem;
align-self: center;
`;

const NameDiv = styled.div`
width: 100%;
align-self: center;
margin-left: 1rem;
font-weight: bold;
`;

const CountryListItem = ({ item }) => {
  const apiClient = useContext(APICtx);
  
  const [saved, setSaved] = useState(item.saved);
  
  const savedTxt = (saved && "-") || "+";

  const onListButtonClick = async () => {
    // TODO: Loading UI
    // Save item if not saved
    if (saved === false) {
      try {
        await apiClient.saveCountry(item.code);
        setSaved(true);
      } catch (e) {
        console.error(`Failed to save country with code "${item.code}": ${e}`);
      }
    } else {
      try {
        await apiClient.removeSavedCountry(item.code);
        setSaved(false);
      } catch (e) {
        console.error(`Failed to remove saved country with code "${item.code}": ${e}`);
      }
    }
  };
  
  return (
    <Item>
      <FlagImg src={item.flag} />
      <NameDiv>
        {item.name}
      </NameDiv>

      <button onClick={onListButtonClick}>
        {savedTxt}
      </button>
    </Item>
  );
};

export default CountryListItem;
