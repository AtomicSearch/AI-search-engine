import { useEffect, useState } from "react";
import { usePubSub } from "create-pubsub/react";
import {
  promptPubSub,
  responsePubSub,
  searchResultsPubSub,
  urlsDescriptionsPubSub,
} from "../../modules/pubSub";
import { SearchForm } from "../../components/SearchForm";
import { Toaster } from "react-hot-toast";
import Markdown from "markdown-to-jsx";
import { getDisableAiResponseSetting } from "../../modules/pubSub";
import { SearchResultsList } from "../../components/SearchResultsList";
import { Gossip as GossipNiche } from "../../modules/gossip.textGeneration.engine";
import { useLocation } from "react-router-dom";
import { search } from "../../modules/search";
import { Footer } from "../../components/Footer";
import { UpgradePlanModal } from "../../components/UpgradePlanModal";
import styled from "styled-components";
import { LoadingSpinner } from "../../components/atoms/Loading";

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

export const SearchPage = () => {
  const [query, setQuery] = usePubSub(promptPubSub);
  const [response, setResponse] = usePubSub(responsePubSub);
  const [searchResults, setSearchResults] = usePubSub(searchResultsPubSub);
  const [urlsDescriptions] = usePubSub(urlsDescriptionsPubSub);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  const clearResponses = () => {
    setResponse("");
  };

  useEffect(() => {
    GossipNiche.prepareTextGeneration();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newQuery = params.get("q");
    if (newQuery !== null) {
      setQuery(newQuery);
    }
  }, [location.search, setQuery]);

  // Add a new useEffect hook to call the search function when query changes
  useEffect(() => {
    async function performSearch() {
      setIsLoading(true);
      const results = await search(query);
      setSearchResults(results);
      setIsLoading(false);
    }
    performSearch();
  }, [query, setSearchResults]);

  return (
    <>
      <SearchForm query={query} updateQuery={setQuery} clearResponses={clearResponses} />
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Answering...</LoadingText>
        </LoadingContainer>
      )}

      {!getDisableAiResponseSetting() && response.length > 0 && (
        <div className="mt-4">
          <div className="bg-gray-100 p-4 rounded-md mt-2">
            <Markdown>{response}</Markdown>
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <SearchResultsList
            searchResults={searchResults}
            urlsDescriptions={urlsDescriptions}
          />
        </div>
      )}
      <UpgradePlanModal />
      <Toaster />
      <Footer hasEmptyResults={searchResults.length === 0} />
    </>
  );
};
