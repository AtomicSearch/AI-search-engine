import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from "styled-components";

import { SearchPage } from "../pages/search/SearchPage";
import { ComparisonPage } from "../pages/static/ComparisonPage";
import { PricingPage } from '../pages/static/PricingPage';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const Header = styled.header`
  background-color: #ffffff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Logo = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #007bff;
`;

export const Main = styled.main`
  flex: 1;
  padding: 20px;
`;

export const Footer = styled.footer`
  background-color: #ffffff;
  padding: 20px;
  text-align: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
`;

function InnerApp() {

  return (
    <>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/comparison-google" element={<ComparisonPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </>
  );
}

export const App = () => {
  return (
    <Router>
      <InnerApp />
    </Router>
  );
}
