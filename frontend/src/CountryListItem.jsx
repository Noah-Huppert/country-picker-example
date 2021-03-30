import React, {
  useState,
  useContext,
  useEffect,
} from "react";
import styled from "styled-components";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { APICtx } from "./App.jsx";
import COLORS from "./colors.js";

const Item = styled.div`
max-width: 20rem;
display: flex;
align-items: center;
border-radius: 0.3rem;
padding: 1rem;
margin-bottom: 0.5rem;
background: white;
color: black;
`;

const FlagImg = styled.img`
width: 2rem;
height: 1rem;
align-self: center;
border: 1px solid black;
`;

const NameDiv = styled.div`
width: 100%;
align-self: center;
margin-left: 1rem;
font-weight: bold;
`;

const SaveRemoveButton = styled(Button)`
display: flex;
width: 3rem;
height: 2rem;
line-height: 2rem;
border-radius: 2rem;
font-weight: bold;
align-items: center;
align-content: center;
flex-direction: column;
padding: 0;
margin: 0;
`;

const LoadingSpinner = styled(Spinner)`
display: flex;
width: 1rem;
height: 1rem;
line-height: 1rem;
margin-top: 0.5rem;
`;

const RemoveButtonTxtContainer = styled.div`
display: flex;
font-size: 3rem;
line-height: 1.5rem;
`;
const RemoveButtonTxtEl = () => {
  return (
    <RemoveButtonTxtContainer>
      -
    </RemoveButtonTxtContainer>
  );
};

const SaveButtonTxtContainer = styled.div`
display: flex;
font-size: 2rem;
`;
const SaveButtonTxtEl = () => {
  return (
    <SaveButtonTxtContainer>
      +
    </SaveButtonTxtContainer>
  );
};

/**
 * Displays a country with its flag, name, and save button.
 * @params item {Country} To display.
 */
const CountryListItem = ({ item }) => {
  const apiClient = useContext(APICtx);

  const [loading, setLoading] = useState(false);
  
  // Keep track of if this list item is currently mounted in the DOM. If it isn't that means the parent component removed this item from the list, so we don't want to do any sort of state updates when we are unmounted
 
  let mounted = true;
  useEffect(() => {
    return () => {
      mounted = false;
    };
  }, []);

  const onListButtonClick = async () => {
    setLoading(true);
    // Save item if not saved
    if (item.saved === false) {
      try {
        await apiClient.saveCountry(item);
      } catch (e) {
        console.error(`Failed to save country with code "${item.code}": ${e}`);
      }
    } else {
      try {
        await apiClient.removeSavedCountry(item.code);
      } catch (e) {
        console.error(`Failed to remove saved country with code "${item.code}": ${e}`);
      }
    }

    if (mounted === true) {
      setLoading(false);
    }
  };
  
  return (
    <Item>
      <FlagImg src={item.flag} />
      <NameDiv>
        {item.name}
      </NameDiv>

      <SaveRemoveButton onClick={onListButtonClick}>
        {loading === true && (
          <LoadingSpinner
            animation="border"
            variant="white"
          />
        ) || item.saved === true && (
          <RemoveButtonTxtEl>
          -
          </RemoveButtonTxtEl>
        ) || (
          <SaveButtonTxtEl>
          +
          </SaveButtonTxtEl>
        )}
      </SaveRemoveButton>
    </Item>
  );
};

export default CountryListItem;
