import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import Markdown from "markdown-to-jsx";

import styled from "styled-components";
import toast from "react-hot-toast";

import { SearchResults } from "../modules/search";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { BlurredText } from "./atoms/Blur.atom";
import { SubscriptionPlan } from "../constants/appInfo.constant";
import { ToastModal } from "./styles/ToastModel.style";

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
    toast.custom(
      <ToastModal>
        <p>
          Unlock full URLs and enhanced search results with a premium account.
        </p>

        <UpgradeButton
          onClick={() =>
            (window.location.href = SubscriptionPlan.PRICING_PAGE_URL)
          }
        >
          Upgrade Now
        </UpgradeButton>
      </ToastModal>,
      {
        duration: Infinity,
        style: {
          background: "transparent",
          boxShadow: "none",
        },
      },
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
              <cite
                onClick={showUpgradeMessage}
                style={{
                  fontSize: "small",
                  color: "gray",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                <BlurredText>
                  {new URL(url).hostname.replace("www.", "")}
                </BlurredText>
              </cite>
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
