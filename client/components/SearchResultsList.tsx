import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import toast from "react-hot-toast";

import { SearchResults } from "../modules/search";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import { BlurredText } from "./atoms/Blur.atom";
import { ToastModal } from "./atoms/ToastModel.atom";
import { BlueButton } from "./atoms/Button.atom";
import { Millisecond } from "../constants/time.constant";
import { messages } from "../modules/en.messages.constants";
import { RoutePaths } from "../../config/routes.config";

export function SearchResultsList({
  searchResults,
  urlsDescriptions,
}: {
  searchResults: SearchResults;
  urlsDescriptions: Record<string, string>;
}) {
  const [windowWidth, setWindowWidth] = useState(self.innerWidth);
  const [notificationModalShown, setNotificationModalShown] =
    useState<boolean>(false);

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
    setNotificationModalShown(true); // Prevent showing the modal multiple times

    toast.custom(
      <ToastModal>
        <p>
          Unlock full URLs and enhanced search results with a premium account.
        </p>

        <BlueButton
          onClick={() =>
            (window.location.href = RoutePaths.SUBSCRIPTION)
          }
        >
          {messages.upgrade}
        </BlueButton>
      </ToastModal>,
      {
        duration: Millisecond.FOUR_SECOND,
        style: {
          background: "transparent",
          boxShadow: "none",
        },
      },
    );
  };

  return (
    <ul>
      {searchResults.map(([title, , url], index) => (
        <li key={url}>
          <Tooltip
            id={`search-result-${index}`}
            place="top-start"
            variant="info"
            opacity="1"
          >
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
              target="_blank"
              data-tooltip-id={`search-result-${index}`}
            >
              {title}
            </a>
            {isUserSubscribed ? (
              <a
                href={url}
                target="_blank"
                data-tooltip-id={`search-result-${index}`}
              >
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
                onClick={() => {
                  if (!notificationModalShown) {
                    showUpgradeMessage();
                  }
                }}
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
            <blockquote>{urlsDescriptions[url]}</blockquote>
          )}
        </li>
      ))}
    </ul>
  );
}
