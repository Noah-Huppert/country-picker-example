import React from "react";
import styled from "styled-components";

const Item = styled.div`
width: 20rem;
display: flex;
border: 1px solid black;
padding: 1rem;
margin-bottom: 0.5rem;
`;

const FlagImg = styled.img`
max-height: 2rem;
align-self: center;
`;

const NameDiv = styled.div`
width: 100%;
align-self: center;
margin-left: 1rem;
font-weight: bold;
`;

const CountryListItem = ({ item }) => {
  const savedTxt = (item.saved && "-") || "+";
  
  return (
    <Item>
      <FlagImg src={item.image} />
      <NameDiv>
        {item.name}
      </NameDiv>

      <button>
        {savedTxt}
      </button>
    </Item>
  );
};

export default CountryListItem;
