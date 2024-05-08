import { createPubSub } from "create-pubsub";
import { SearchResults } from "./search";

const SearchOptions = {
  IS_AI_RESPONSE_DISABLED: false,
  IS_WEBGPU_USAGE_DISABLED: true,

  // enable by default
  IS_LINKS_SUMMARIZED_ENABLED: true,
  IS_LARGE_MODEL_ENABLED: false, // true =Llama, false = Gemma
};

function createLocalStoragePubSub<T>(localStorageKey: string, defaultValue: T) {
  const localStorageValue = localStorage.getItem(localStorageKey);
  const localStoragePubSub = createPubSub(
    localStorageValue ? (JSON.parse(localStorageValue) as T) : defaultValue,
  );

  const [, onValueChange] = localStoragePubSub;

  onValueChange((value) =>
    localStorage.setItem(localStorageKey, JSON.stringify(value)),
  );

  return localStoragePubSub;
}

export const disableAiResponseSettingPubSub = createLocalStoragePubSub(
  "disableAiResponse",
  SearchOptions.IS_AI_RESPONSE_DISABLED,
);

export const [, , getDisableAiResponseSetting] = disableAiResponseSettingPubSub;

export const summarizeLinksSettingPubSub = createLocalStoragePubSub(
  "summarizeLinks",
  SearchOptions.IS_LINKS_SUMMARIZED_ENABLED,
);

export const [, , getSummarizeLinksSetting] = summarizeLinksSettingPubSub;

export const useLargerModelSettingPubSub = createLocalStoragePubSub(
  "useLargerModel",
  SearchOptions.IS_LARGE_MODEL_ENABLED,
);

export const [, , getUseLargerModelSetting] = useLargerModelSettingPubSub;

export const disableWebGpuUsageSettingPubSub = createLocalStoragePubSub(
  "disableWebGpuUsage",
  SearchOptions.IS_WEBGPU_USAGE_DISABLED,
);

export const [, , getDisableWebGpuUsageSetting] =
  disableWebGpuUsageSettingPubSub;

export const querySuggestionsPubSub = createLocalStoragePubSub<string[]>(
  "querySuggestions",
  [],
);

export const [updateQuerySuggestions, , getQuerySuggestions] =
  querySuggestionsPubSub;

export const promptPubSub = createPubSub("");

export const [updatePrompt] = promptPubSub;

export const responsePubSub = createPubSub("");

export const [updateResponse] = responsePubSub;

export const searchResultsPubSub = createPubSub<SearchResults>([]);

export const [updateSearchResults, , getSearchResults] = searchResultsPubSub;

export const urlsDescriptionsPubSub = createPubSub<Record<string, string>>({});

export const [updateUrlsDescriptions, , getUrlsDescriptions] =
  urlsDescriptionsPubSub;
