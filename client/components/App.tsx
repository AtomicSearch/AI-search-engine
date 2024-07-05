import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import styled from "styled-components";

import { SearchPage } from "../pages/search/SearchPage";
import { ComparisonPage } from "../pages/static/ComparisonPage";
import { PricingPage } from "../pages/subscription/PricingPage";
import { AboutMissionPage } from "../pages/static/AboutMissionPage";
import { RoutePaths } from "../../config/routes.config";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Root = styled.main`
  flex: 1;
`;

function InnerApp() {
  return (
    <>
      <Root>
        <Routes>
          <Route path={RoutePaths.SEARCH} element={<SearchPage />} />
          <Route path={RoutePaths.COMPARISON} element={<ComparisonPage />} />
          <Route path={RoutePaths.MISSION} element={<AboutMissionPage />} />
          <Route path={RoutePaths.SUBSCRIPTION} element={<PricingPage />} />
        </Routes>
      </Root>
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
