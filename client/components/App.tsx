import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { SearchPage } from "../pages/search/SearchPage";
import { ComparisonPage } from "../pages/static/ComparisonPage";
import { PricingPage } from '../pages/static/PricingPage';

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
