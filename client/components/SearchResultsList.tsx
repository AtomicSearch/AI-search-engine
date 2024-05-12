import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import Markdown from "markdown-to-jsx";
import { SearchResults } from "../modules/search";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { BlurredText } from "./atoms/Blurr";
import styled from "styled-components";

const UpgradeContainer = styled.div`
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UpgradeMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: #555;
`;

const UpgradeButton = styled.button`
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

export function SearchResultsList({
  searchResults,
  urlsDescriptions,
}: {
  searchResults: SearchResults;
  urlsDescriptions: Record<string, string>;
}) {
  const [windowWidth, setWindowWidth] = useState(self.innerWidth);
  const isUserSubscribed = useSubscriptionStatus();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(self.innerWidth);
    };

    self.addEventListener("resize", handleResize);

    return () => {
      self.removeEventListener("resize", handleResize);
    };
  }, []);

  const shouldDisplayDomainBelowTitle = windowWidth < 720;

  return (
    <ul>
      {searchResults.map(([title, snippet, url], index) => (
        <li key={url}>
          <Tooltip
            id={`search-result-${index}`}
            place="top-start"
            variant="info"
            opacity="1"
            style={{ width: "75vw", maxWidth: "600px" }}
          >
            {snippet}
            <br />
            <br />
            {url}
          </Tooltip>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: shouldDisplayDomainBelowTitle ? 0 : "1rem",
              flexDirection: shouldDisplayDomainBelowTitle ? "column" : "row",
            }}
          >
            <a
              href={url}
              data-tooltip-id={`search-result-${index}`}
              target="_blank"
            >
              {title}
            </a>
            {isUserSubscribed ? (
              <a href={url} target="_blank">
                <cite
                  style={{
                    fontSize: "small",
                    color: "gray",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new URL(url).hostname.replace("www.", "")}
                </cite>
              </a>
            ) : (
              <BlurredText>
                <cite
                  style={{
                    fontSize: "small",
                    color: "gray",
                    whiteSpace: "nowrap",
                  }}
                >
                  {new URL(url).hostname.replace("www.", "")}
                </cite>
              </BlurredText>
            )}
          </div>
          {!isUserSubscribed && (
            <UpgradeContainer>
              <UpgradeMessage>
                Unlock full URLs and enhanced search results with a premium account.
              </UpgradeMessage>
              <UpgradeButton>Upgrade Now</UpgradeButton>
            </UpgradeContainer>
          )}
          {urlsDescriptions[url] && (
            <Markdown>{urlsDescriptions[url]}</Markdown>
          )}
        </li>
      ))}
    </ul>
  );
}
