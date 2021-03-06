import React from "react";
import styled from "styled-components";
import Navbar from "react-bootstrap/Navbar";

import APIClient from "./api.js";
import CountriesSearch from "./CountriesSearch.jsx";
import SavedCountriesList from "./SavedCountriesList.jsx";

import COLORS from "./colors.js";
import worldMapIcon from "./imgs/world-map.png";

const NavbarBrandImg = styled.img`
width: 2.5rem;
`;
const NavbarBrandTitle = styled.span`
font-size: 1.3rem;
font-weight: bold;
`;

const Content = styled.div`
display: flex;
align-content: start;
align-self: center;
padding: 1rem;
flex-wrap: wrap;
`;

const ContentSection = styled.div`
padding: 1rem;
margin: 1rem;
border-radius: 0.2rem;
`;

const ContentSectionTitle = styled.div`
font-size: 2rem;
font-weight: bold;
margin-bottom: 1rem;
`;

const APICtx = React.createContext();

const App = () => {
  return (
    <>
      <APICtx.Provider value={new APIClient()}>
        <Navbar bg="primary" variant="dark">
          <Navbar.Brand>
            <NavbarBrandImg
              alt="World map"
              src={worldMapIcon} />
            {' '}
            <NavbarBrandTitle>
              Country Picker
            </NavbarBrandTitle>
          </Navbar.Brand>
        </Navbar>

        <Content>
          <ContentSection>
            <ContentSectionTitle>
              Add Countries
            </ContentSectionTitle>
            
            <CountriesSearch />
          </ContentSection>
          <ContentSection>
            <ContentSectionTitle>
              Saved Countries
            </ContentSectionTitle>
            
            <SavedCountriesList />
          </ContentSection>
        </Content>
      </APICtx.Provider>
    </>
  );
};

export default App;
export { APICtx };
