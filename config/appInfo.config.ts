export enum AppInfo {
  APP_NAME = "Massive Prediction",
  APP_TAGLINE = "Making Knowledge Search Impactful in AI Era",
  APP_SHORT_DESCRIPTION = "Retrieve specific findings in minutes",
  APP_URL = "http://localhost:7860",
  NOTIFY_ME_FORM_API_URL = "https://send.pageclip.co/arfoGnoQdNuEAQAL841uEo3nxLvjo3hk/Waiting_List_AtomicSearch_phone_numbers",
}

export enum Search {
  DEFAULT_SUGGESTED_QUERY = "Pro Query?",
  MAXIMUM_SUGGESTIONS = 25,
  SEARCH_QUERY_LIMIT_LENGTH = 2000,
  SUMMARIZE_LINKS_LIMIT_LENGTH = 2500,
  MAXIMUM_FREE_QUERY_WORDS = 10,
  MAXIMUM_FREE_QUERIES_PER_HOUR = 40,
  SEARCH_URL = "http://127.0.0.1:8080/search",
}

// SearXNG engines
export enum CategoryEngine {
  MINIMUM = "google,bing,youtube,duckduckgo", // minimum everyday queries
  EVERYDAY = "google,bing,youtube,duckduckgo,wikipedia", // generic everyday queries
  RESEARCH = "arxiv,google scholar,semantic scholar,pubmed,openairedatasets,wikipedia,wikidata", // AI and Machine Learning Research
}

export enum Model {
  Llama = "Llama-3-8B-Instruct-q4f16_1-MLC",
  Mistral = "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
  Gemma = "gemma-2b-it-q4f16_1-MLC",
  Phi = "Phi-3-mini-4k-instruct-q4f16_1-MLC",
  TinyLlama = "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
}

export enum I18n {
  DEFAULT_COUNTRY_CODE = "US",
  DEFAULT_LANGUAGE_COUNTRY_CODE = "en-US",
  DEFAULT_LANGUAGE_CODE = "en",
  DEFAULT_LANGUAGE = "english",
}

export enum AppLegalLink {
  TERMS = "https://your-terms-url", // Your terms URL
  PRIVACY = "https://your-privacy-url", // Your privacy URL
  CONTACT_EMAIL = "contact@ph7.me",
}

export enum GitHubInfo {
  AUTHOR_GITHUB_URL = "https://github.com/pH-7",
  AUTHOR_GITHUB_HANDLE = "@pH-7",
  ORG_GITHUB_URL = "https://github.com/SucceedAI",
}

export enum XInfo {
  AUTHOR_X_URL = "http://x.com/phenrysay",
  AUTHOR_X_HANDLE = "@phenrysay",
}

export enum SubscriptionPlan {
  PRICE_DISPLAYED = "$2.95/pw",
  PLAN_NAME = "Smarter Plan",
  ACTIVE_STATUS = "active",
  DEACTIVATED_STATUS = "deactivated",
  PAYMENT_GATEWAY_PUBLIC_KEY = "pk_test_51J4J9zLz1c1a3J4J",
  PRICE_ID = "price_1J4J9zLz1c1a3J4J",
}

export enum CheckoutInfo {
  PRO_SUBSCRIPTION_URL = "https://your-lemonsqueezy-checkout-url", // Lemon Squeezy checkout URL
}
