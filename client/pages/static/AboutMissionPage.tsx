import styled from "styled-components";
import { AppInfo } from "../../constants/appInfo.constant";

const AboutPageWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #0066cc;
`;

const MissionStatement = styled.p`
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 40px;
  text-align: center;
`;

const MissionPointsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const MissionPoint = styled.div`
  flex-basis: 30%;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const MissionPointIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: #0066cc;
`;

const MissionPointTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const MissionPointDescription = styled.p`
  font-size: 16px;
  line-height: 1.5;
`;

const MassivePredictionWrapper = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const MassivePredictionTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #0066cc;
`;

const MassivePredictionDescription = styled.p`
  font-size: 18px;
  line-height: 1.5;
`;

const ClosingStatement = styled.div`
  font-size: 20px;
  line-height: 1.5;
  text-align: center;
  margin-top: 40px;
  font-style: italic;
  color: #666;
`;

export const AboutMissionPage = () => {
  return (
    <AboutPageWrapper>
      <PageTitle>Our Mission</PageTitle>
      <MissionStatement>
        At {AppInfo.APP_NAME}, we believe that search should be impactful in the
        AI era. Our mission is to empower individuals with instant access to the
        most relevant and high-quality information, enabling them to make
        informed decisions and expand their knowledge.
      </MissionStatement>

      <MissionPointsWrapper>
        <MissionPoint>
          <MissionPointIcon>
            <i className="fas fa-source"></i>
          </MissionPointIcon>
          <MissionPointTitle>Choosing Your Source</MissionPointTitle>
          <MissionPointDescription>
            We understand the importance of reliable and trustworthy
            information. Unlike traditional search engines that provide results
            without any control over sources, {AppInfo.APP_NAME} prioritizes
            content from reputable and authoritative sources. We believe that
            you should have the power to choose the sources that align with your
            values and information needs.
          </MissionPointDescription>
        </MissionPoint>

        <MissionPoint>
          <MissionPointIcon>
            <i className="fas fa-search"></i>
          </MissionPointIcon>
          <MissionPointTitle>
            Instant Results with Full-Text Search AI
          </MissionPointTitle>
          <MissionPointDescription>
            {AppInfo.APP_NAME} leverages advanced full-text search AI technology
            to deliver instant results. Our intelligent algorithms analyze and
            understand the content of web pages, ensuring that you receive the
            most relevant information quickly and efficiently. Say goodbye to
            endless scrolling and irrelevant results.
          </MissionPointDescription>
        </MissionPoint>

        <MissionPoint>
          <MissionPointIcon>
            <i className="fas fa-star"></i>
          </MissionPointIcon>
          <MissionPointTitle>Prioritizing Great Content</MissionPointTitle>
          <MissionPointDescription>
            We believe that exposure to great content not only satisfies your
            search queries but also enriches your mind. {AppInfo.APP_NAME}{" "}
            prioritizes high-quality content that is informative,
            well-researched, and thought-provoking. By using our search engine,
            you can be confident that you are accessing the best resources
            available, helping you become smarter and more knowledgeable with
            every search.
          </MissionPointDescription>
        </MissionPoint>
      </MissionPointsWrapper>

      <MassivePredictionWrapper>
        <MassivePredictionTitle>
          {AppInfo.APP_NAME} - Making Search Impactful in the AI Era
        </MassivePredictionTitle>
        <MassivePredictionDescription>
          {AppInfo.APP_NAME} is proudly developed by {AppInfo.APP_NAME}, a
          company dedicated to revolutionizing search in the AI era. We are
          committed to harnessing the power of artificial intelligence to
          enhance the search experience and deliver meaningful results that have
          a positive impact on people's lives.
        </MassivePredictionDescription>
      </MassivePredictionWrapper>

      <ClosingStatement>
        <p>
          Join us on this exciting journey as we redefine search and empower
          individuals with the knowledge they need to thrive in the AI era. With{" "}
          {AppInfo.APP_NAME}, you can trust that every search will be a step
          towards personal growth and discovery.
        </p>
      </ClosingStatement>
    </AboutPageWrapper>
  );
};
