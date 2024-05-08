import styled from "styled-components";

const ComparisonPageWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
`;

const ComparisonPageTitle = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #0066cc;
`;

const ComparisonPointsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const ComparisonPoint = styled.div`
  flex-basis: 30%;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ComparisonPointIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: #0066cc;
`;

const ComparisonPointTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const ComparisonPointDescription = styled.p`
  font-size: 16px;
  line-height: 1.5;
`;

export const ComparisonPage = () => {
  return (
    <ComparisonPageWrapper>
      <ComparisonPageTitle>
        MassivePrediction vs. Google Search
      </ComparisonPageTitle>
      <ComparisonPointsWrapper>
        <ComparisonPoint>
          <ComparisonPointIcon>🧠</ComparisonPointIcon>
          <ComparisonPointTitle>AI-Powered Search</ComparisonPointTitle>
          <ComparisonPointDescription>
            MassivePrediction leverages cutting-edge AI technologies to provide
            accurate and contextually relevant search results.
          </ComparisonPointDescription>
        </ComparisonPoint>
        <ComparisonPoint>
          <ComparisonPointIcon>📊</ComparisonPointIcon>
          <ComparisonPointTitle>Predictive Analytics</ComparisonPointTitle>
          <ComparisonPointDescription>
            Our search engine goes beyond simple keyword matching, utilizing
            predictive analytics to anticipate user needs and deliver proactive
            insights.
          </ComparisonPointDescription>
        </ComparisonPoint>
        <ComparisonPoint>
          <ComparisonPointIcon>🌍</ComparisonPointIcon>
          <ComparisonPointTitle>Impactful Search</ComparisonPointTitle>
          <ComparisonPointDescription>
            With MassivePrediction, your search experience is not only efficient
            but also impactful, empowering you to make informed decisions and
            drive meaningful change.
          </ComparisonPointDescription>
        </ComparisonPoint>
      </ComparisonPointsWrapper>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Google</th>
            <th>MassivePrediction</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>AI-Powered Search</td>
            <td>Partial</td>
            <td>Advanced</td>
          </tr>
          <tr>
            <td>Predictive Analytics</td>
            <td>Limited</td>
            <td>Extensive</td>
          </tr>
          <tr>
            <td>Impactful Results</td>
            <td>Moderate</td>
            <td>High</td>
          </tr>
        </tbody>
      </table>
      <h2>Pros of MassivePrediction</h2>
      <ul>
        <li>
          Harnesses the power of AI for enhanced search accuracy and relevance
        </li>
        <li>
          Provides predictive insights to help users make informed decisions
        </li>
        <li>Delivers impactful search results that drive meaningful change</li>
      </ul>
      <h2>Cons of Google Search</h2>
      <ul>
        <li>Relies primarily on traditional keyword matching techniques</li>
        <li>Limited predictive capabilities compared to MassivePrediction</li>
        <li>
          Search results may not always have a significant impact on user
          actions
        </li>
      </ul>
    </ComparisonPageWrapper>
  );
};
