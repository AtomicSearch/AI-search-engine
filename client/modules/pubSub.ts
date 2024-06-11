import { createPubSub } from "create-pubsub";
import { SearchResults } from "./search";
import { isRunningOnMobile } from "./mobileDetection";

const SearchOptions = {
  IS_AI_RESPONSE_DISABLED: false,
  IS_WEBGPU_USAGE_DISABLED: false,

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

export const numberOfThreadsSettingPubSub = createLocalStoragePubSub(
  "numberOfThreads",
  !isRunningOnMobile && (navigator.hardwareConcurrency ?? 1) > 1
    ? Math.max(navigator.hardwareConcurrency - 2, 2)
    : 1,
);

export const [, , getNumberOfThreadsSetting] = numberOfThreadsSettingPubSub;

export const querySuggestionsPubSub = createLocalStoragePubSub<string[]>(
  "querySuggestions",
  [],
);

export const lastSearchTokenHashPubSub = createLocalStoragePubSub(
  "lastSearchTokenHash",
  "",
);

export const [updateLastSearchTokenHash, , getLastSearchTokenHash] =
  lastSearchTokenHashPubSub;

export const [updateQuerySuggestions, , getQuerySuggestions] =
  querySuggestionsPubSub;

export const queryPubSub = createPubSub(
  new URLSearchParams(self.location.search).get("q") ?? "",
);

export const [updateQuery, , getQuery] = queryPubSub;

export const responsePubSub = createPubSub("");

export const [updateResponse] = responsePubSub;

export const searchResultsPubSub = createPubSub<SearchResults>([]);

export const [updateSearchResults, , getSearchResults] = searchResultsPubSub;

export const urlsDescriptionsPubSub = createPubSub<Record<string, string>>({});

export const [updateUrlsDescriptions] = urlsDescriptionsPubSub;

export const debugModeEnabledPubSub = createPubSub(
  new URLSearchParams(self.location.search).has("debug"),
);

export const [, , isDebugModeEnabled] = debugModeEnabledPubSub;

export const interruptTextGenerationPubSub = createPubSub();

export const [interruptTextGeneration, onTextGenerationInterrupted] =
  interruptTextGenerationPubSub;
