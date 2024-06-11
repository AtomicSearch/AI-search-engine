import { useCallback, useEffect, useState } from "react";
import { usePubSub } from "create-pubsub/react";
import Markdown from "markdown-to-jsx";
import {
  queryPubSub,
  responsePubSub,
  searchResultsPubSub,
  urlsDescriptionsPubSub,
} from "../../modules/pubSub";
import { SearchForm } from "../../components/SearchForm";
import { Toaster } from "react-hot-toast";
import { getDisableAiResponseSetting } from "../../modules/pubSub";
import { SearchResultsList } from "../../components/SearchResultsList";
import { Engine } from "../../modules/textGeneration.engine";
import { useLocation } from "react-router-dom";
import { SearchResults, search } from "../../modules/search";
import { Footer } from "../../components/Footer";
import { UpgradePlanModal } from "../../components/modals/UpgradePlanModal";
import styled from "styled-components";
import { LoadingSpinner } from "../../components/atoms/Loading.atom";
import { SettingsButton } from "../../components/SettingsButton";
import { useSubscriptionStatus } from "../../hooks/useSubscriptionStatus";
import { useQueryCount } from "../../hooks/useQueryCount";

const SearchBlock = styled.div`
  backgroundColor: "var(--background)",
  borderRadius: "6px",
  padding: "10px 25px",
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const LoadingText = styled.span`
  font-size: 16px;
  color: #333;
`;

const SubscriptionBasedComponent = () => {
  const isUserSubscribed = useSubscriptionStatus();
  return isUserSubscribed ? <SettingsButton /> : <UpgradePlanModal />;
};

export const SearchPage = () => {
  const [query, setQuery] = usePubSub(queryPubSub);
  const [response, setResponse] = usePubSub(responsePubSub);
  const [searchResults, setSearchResults] =
    usePubSub<SearchResults>(searchResultsPubSub);
  const [urlsDescriptions] = usePubSub(urlsDescriptionsPubSub);
  const [isLoading, setIsLoading] = useState(false);
  const { incrementQueryCount } = useQueryCount();

  const location = useLocation();

  const clearResponses = useCallback(() => {
    setSearchResults([]);
    setResponse("");
  }, [setSearchResults, setResponse]);

  useEffect(() => {
    Engine.prepareTextGeneration();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newQuery = params.get("q");
    if (newQuery !== null) {
      setQuery(newQuery);
    }
  }, [location.search, setQuery]);

  const performSearch = useCallback(async () => {
    if (query.length) {
      if (!searchResults.length) {
        // if no results yet, activate loading spinner
        setIsLoading(true);
      }

      try {
        const results = await search(query);
        setSearchResults(results);

        // Increment query count when a search result is received
        incrementQueryCount();
      } catch (error) {
        console.error("Error performing search:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [query, setSearchResults, incrementQueryCount]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const shouldResultsBeShown = searchResults.length > 0 && query.length > 0;

  return (
    <>
      <SearchForm
        query={query}
        updateQuery={setQuery}
        clearResponses={clearResponses}
      />
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Answering...</LoadingText>
        </LoadingContainer>
      )}

      {!getDisableAiResponseSetting() && response.length > 0 && (
        <SearchBlock className="mt-4">
          <div className="bg-gray-100 p-4 rounded-md mt-2">
            <Markdown>{response}</Markdown>
          </div>
        </SearchBlock>
      )}

      {shouldResultsBeShown && (
        <div>
          <SearchResultsList
            searchResults={searchResults}
            urlsDescriptions={urlsDescriptions}
          />
        </div>
      )}

      <SubscriptionBasedComponent />
      <Toaster />
      <Footer hasEmptyResults={searchResults.length === 0} />
    </>
  );
};
