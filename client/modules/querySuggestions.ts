import { Search } from "../constants/appInfo.constant";
import { getQuerySuggestions, updateQuerySuggestions } from "./pubSub";

export const querySuggestions: string[] = [];

export async function getRandomQuerySuggestion() {
  if (getQuerySuggestions().length === 0) {
    await refillQuerySuggestions(Search.MAXIMUM_SUGGESTIONS);
  }

  const querySuggestions = getQuerySuggestions();

  const randomQuerySuggestion = querySuggestions.pop() as string;

  updateQuerySuggestions(querySuggestions);

  return randomQuerySuggestion;
}

async function refillQuerySuggestions(limit?: number): Promise<void> {
  const querySuggestionsFileUrl = new URL(
    "/gossip.query-suggestions.json",
    self.location.origin,
  );

  let querySuggestionsList: string[];
  try {
    const suggestionsUrl = querySuggestionsFileUrl.toString();
    const fetchResponse = await fetch(suggestionsUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    querySuggestionsList = await fetchResponse.json();
  } catch (e) {
    console.error("Couldn't fetch the suggestions file", JSON.stringify(e));
    querySuggestionsList = [];
  }

  updateQuerySuggestions(
    querySuggestionsList.sort(() => Math.random() - 0.5).slice(0, limit),
  );
}
