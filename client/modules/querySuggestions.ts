import { Search } from "../constants/appInfo.constant";
import { getQuerySuggestions, updateQuerySuggestions } from "./pubSub";

export const querySuggestions: string[] = [];

export async function getRandomQuerySuggestion() {
  if (getQuerySuggestions().length === 0) {
    await refillQuerySuggestions(Search.DEFAULT_LIMIT_SUGGESTIONS);
  }

  const querySuggestions = getQuerySuggestions();

  const randomQuerySuggestion = querySuggestions.pop() as string;

  updateQuerySuggestions(querySuggestions);

  return randomQuerySuggestion;
}

async function refillQuerySuggestions(limit?: number) {
  const querySuggestionsFileUrl = new URL(
    "/gossip.query-suggestions.json",
    self.location.origin,
  );

  const fetchResponse = await fetch(querySuggestionsFileUrl.toString());

  const querySuggestionsList: string[] = await fetchResponse.json();

  updateQuerySuggestions(
    querySuggestionsList.sort(() => Math.random() - 0.5).slice(0, limit),
  );
}
