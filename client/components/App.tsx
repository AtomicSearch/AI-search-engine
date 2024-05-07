import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import { SearchPage } from "../pages/search/SearchPage";
import { ComparisonPage } from "../pages/static/ComparisonPage";
import { PricingPage } from "../pages/static/PricingPage";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
`;

function InnerApp() {
  return (
    <>
      <Main>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/comparison-google" element={<ComparisonPage />} />
          <Route path="/mission" element={<MissionPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </Main>
    </>
  );
}

export const App = () => {
  return (
    <Router>
      <AppContainer>
        <InnerApp />
      </AppContainer>
    </Router>
  );
};
