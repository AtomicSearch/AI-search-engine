import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import Markdown from "markdown-to-jsx";
import { SearchResults } from "../modules/search";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { BlurredText } from "./atoms/Blurr";
import styled from "styled-components";
import toast from "react-hot-toast";

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

  const showUpgradeMessage = () => {
    toast(
      (t) => (
        <div>
          <p>Unlock full URLs and enhanced search results with a premium account.</p>
          <UpgradeButton onClick={() => toast.dismiss(t.id)}>Upgrade Now</UpgradeButton>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "#f8f8f8",
          color: "#555",
          borderRadius: "8px",
          padding: "16px",
        },
      }
    );
  };

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
              <BlurredText onClick={showUpgradeMessage}>
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
          {urlsDescriptions[url] && (
            <Markdown>{urlsDescriptions[url]}</Markdown>
          )}
        </li>
      ))}
    </ul>
  );
}
