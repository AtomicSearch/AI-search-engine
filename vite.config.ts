import path from "node:path";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

import react from "@vitejs/plugin-react";
import basicSSL from "@vitejs/plugin-basic-ssl";
import { RateLimiterMemory } from "rate-limiter-flexible";
import {
  initModel,
  distance as calculateSimilarity,
  EmbeddingsModel,
} from "@energetic-ai/embeddings";
import temporaryDirectory from "temp-dir";
import Redis, { Redis as RedisClient } from "ioredis";
import { PreviewServer, ViteDevServer, defineConfig } from "vite";
import { modelSource as embeddingModel } from "@energetic-ai/model-embeddings-en";
import compression from "http-compression";
import { argon2Verify } from "hash-wasm";
import { StatusCodes } from "http-status-codes";

import { Millisecond } from "./client/constants/time.constant";
import { CategoryEngine } from "./config/appInfo.config";
import { stripHtmlTags } from "./utils/strip-tags";

//import { supportedSearchEngines } from "./client/config/search-engines"

const REDIS_CACHE_EXPIRATION_TIME_SECONDS = 7200; // 2 hour
const RATE_LIMITER_OPTIONS = {
  points: 15, // Maximum number of requests allowed within the duration
  duration: 5, // Duration in seconds
};

type SearchResult = [title: string, content: string, url: string];

const isCacheEnabled = process.env.IS_CACHE_ENABLED === "true";
const redisClient = isCacheEnabled
  ? new Redis({
      host: "redis", // Use the service name from docker-compose.yml
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
    })
  : undefined;

const serverStartTime = new Date().getTime();
let searchesSinceLastRestart = 0;
const verifiedTokens = new Set();

export default defineConfig(({ command }) => {
  if (command === "build") {
    regenerateSearchToken();
  }

  return {
    root: "./client",
    define: {
      VITE_SEARCH_TOKEN: JSON.stringify(getSearchToken()),
    },
    server: {
      host: process.env.HOST,
      port: process.env.PORT ? Number(process.env.PORT) : undefined,
      hmr: {
        port: process.env.HMR_PORT ? Number(process.env.HMR_PORT) : undefined,
      },
    },
    preview: {
      host: process.env.HOST,
      port: process.env.PORT ? Number(process.env.PORT) : undefined,
    },
    build: {
      target: "esnext",
    },
    plugins: [
      process.env.BASIC_SSL === "true" ? basicSSL() : undefined,
      react(),
      {
        name: "configure-server-compression",
        configureServer: compressionServerHook,
        configurePreviewServer: compressionServerHook,
      },
      {
        name: "configure-server-cross-origin-isolation",
        configureServer: crossOriginServerHook,
        configurePreviewServer: crossOriginServerHook,
      },
      {
        name: "configure-server-search-endpoint",
        configureServer: searchEndpointServerHook,
        configurePreviewServer: searchEndpointServerHook,
      },
      {
        name: "configure-server-status-endpoint",
        configureServer: statusEndpointServerHook,
        configurePreviewServer: statusEndpointServerHook,
      },
      {
        name: "configure-server-cache",
        configurePreviewServer: cacheServerHook,
      },
    ],
  };
});

function compressionServerHook<T extends ViteDevServer | PreviewServer>(
  server: T,
) {
  server.middlewares.use(compression());
}

function crossOriginServerHook<T extends ViteDevServer | PreviewServer>(
  server: T,
) {
  server.middlewares.use((_, response, next) => {
    /** Server headers for cross origin isolation, which enable clients to use `SharedArrayBuffer` on the Browser. */
    const crossOriginIsolationHeaders: { key: string; value: string }[] = [
      {
        key: "Cross-Origin-Embedder-Policy",
        value: "require-corp",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "cross-origin",
      },
    ];

    crossOriginIsolationHeaders.forEach(({ key, value }) => {
      response.setHeader(key, value);
    });

    next();
  });
}

function statusEndpointServerHook<T extends ViteDevServer | PreviewServer>(
  server: T,
) {
  server.middlewares.use(async (request, response, next) => {
    if (!request.url.startsWith("/status")) return next();

    const secondsSinceLastRestart = Math.floor(
      (new Date().getTime() - serverStartTime) / 1000,
    );

    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        secondsSinceLastRestart,
        searchesSinceLastRestart,
        tokensVerifiedSinceLastRestart: verifiedTokens.size,
      }),
    );
  });
}

function searchEndpointServerHook<T extends ViteDevServer | PreviewServer>(
  server: T,
) {
  const rateLimiter = new RateLimiterMemory(RATE_LIMITER_OPTIONS);

  server.middlewares.use(async (request, response, next) => {
    if (!request.url?.startsWith("/search")) {
      return next();
    }

    const url = `https://${request.headers.host}`;
    const { searchParams } = new URL(request.url, url);

    const limitParam = searchParams.get("limit");

    const limit =
      limitParam && Number(limitParam) > 0 ? Number(limitParam) : undefined;

    const query = searchParams.get("q");

    if (!query) {
      response.statusCode = StatusCodes.BAD_REQUEST;
      response.end("Missing the query parameter.");
      return;
    }

    // retrieve the token from the query string
    const token = searchParams.get("token") || "";

    const isVerifiedToken = verifiedTokens.has(token);

    if (!isVerifiedToken) {
      let isValidToken = false;

      try {
        isValidToken = await argon2Verify({
          password: getSearchToken(),
          hash: token,
        });
      } catch (error) {
        void error;
      }

      if (isValidToken) {
        verifiedTokens.add(token);
      } else {
        response.statusCode = StatusCodes.UNAUTHORIZED;
        response.end("Unauthorized.");
        return;
      }
    }

    try {
      await rateLimiter.consume(token);
    } catch (error) {
      response.statusCode = StatusCodes.TOO_MANY_REQUESTS;
      response.end("Too many requests.");
      return;
    }

    // Try to get the search results from Redis
    let searchResults = await redisClient?.get(query);

    if (searchResults) {
      // If the search results are cached in Redis, parse them and return
      try {
        searchResults = JSON.parse(searchResults);
      } catch (error) {
        console.error("Error parsing JSON data from Redis:", error);
        searchResults = null; // Reset searchResults to null if parsing fails
      }
    }

    if (!searchResults) {
      // Pass the redisClient instance to fetchSearXNG
      const fetchedResults = await fetchSearXNG(query, limit, redisClient);
      searchResults = JSON.stringify(fetchedResults);
      await redisClient.set(query, searchResults);
    }

    searchesSinceLastRestart++;

    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify([]));
      return;
    }

    try {
      const rankedResults = await rankSearchResults(query, searchResults);
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(await rankSearchResults(query, searchResults)),
      );
    } catch (error) {
      console.error("Error ranking search results:", error);
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(searchResults));
    }
  });
}

function cacheServerHook<T extends ViteDevServer | PreviewServer>(server: T) {
  server.middlewares.use(async (request, response, next) => {
    if (request.url.endsWith(".woff2")) {
      response.setHeader(
        "Cache-Control",
        "public, max-age=31536000, immutable",
      );
    } else if (
      request.url === "/" ||
      request.url.startsWith("/?") ||
      request.url.endsWith(".html")
    ) {
      response.setHeader("Cache-Control", "no-cache");
    } else {
      response.setHeader("Cache-Control", "public, max-age=86400");
    }

    next();
  });
}

/**
 * Fetches search results from SearXNG.
 * @param query The search query.
 * @param limit (Optional) The maximum number of search results to return.
 * @returns An array of SearchResult objects representing the search results.
 */
async function fetchSearXNG(
  query: string,
  limit?: number,
  redisClient?: RedisClient,
): Promise<SearchResult[]> {
  const maxRetries = 5;
  const initialDelay = 1000; // Initial delay in milliseconds
  const maxDelay = 30000; // Maximum delay in milliseconds
  const backoffFactor = 2; // Backoff factor for exponential increase

  let delay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if the search results are cached in Redis (if cache is enabled)
      let cachedResults = isCacheEnabled
        ? await redisClient?.get(`searxng:${query}`)
        : undefined;

      if (cachedResults) {
        // If the search results are cached in Redis, parse and return them
        try {
          const parsedResults = JSON.parse(cachedResults);
          return parsedResults;
        } catch (error) {
          console.error("Error parsing JSON data from Redis:", error);
          // Continue with fetching from SearXNG if parsing fails
        }
      }

      const url = new URL("http://127.0.0.1:8080/search");
      //const supportedEngines = supportedSearchEngines.join(",");

      url.search = new URLSearchParams({
        q: query,
        language: "auto",
        safesearch: "0",
        format: "json",
        //engine: supportedEngines,
        //engine: CategoryEngine.MINIMUM,
        //engine: "google,bing,duckduckgo",
        timeout: Millisecond.SIXTY_SECOND.toString(), // Increase the timeout value to 60 seconds
      }).toString();

      console.log(`Fetching search results from SearXNG for query: ${query}`);

      const response = await fetch(url);

      let { results } = (await response.json()) as {
        results: { url: string; title: string; content: string }[];
      };

      console.log(
        `Search results retrieved from SearXNG: ${results.length} results`,
      );

      const searchResults: SearchResult[] = [];

      if (results) {
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }

        const uniqueUrls = new Set<string>();

        for (const result of results) {
          if (!result.content || uniqueUrls.has(result.url)) {
            continue;
          }

          const content = stripHtmlTags(result.content).trim();

          if (content === "") {
            continue;
          }

          const title = stripHtmlTags(result.title);

          const url = result.url;

          searchResults.push([title, content, url]);

          uniqueUrls.add(url);
        }
      }

      // Cache the search results in Redis with an expiration time (e.g., 1 hour) if cache is enabled
      if (isCacheEnabled) {
        await redisClient?.set(
          `searxng:${query}`,
          JSON.stringify(searchResults),
          "EX",
          REDIS_CACHE_EXPIRATION_TIME_SECONDS,
        );
      }

      return searchResults;
    } catch (error) {
      console.error(
        `Error fetching search results from SearXNG (attempt ${attempt + 1}):`,
        error,
      );

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffFactor, maxDelay);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Retrieves the file path for the search token.
 * @returns The file path for the search token.
 */
function getSearchTokenFilePath() {
  return path.resolve(temporaryDirectory, "atomicsearch-token");
}

/**
 * Regenerates the search token and saves it to the search token file.
 */
function regenerateSearchToken() {
  const newToken = Math.random().toString(36).substring(2);
  writeFileSync(getSearchTokenFilePath(), newToken);
}

/**
 * Retrieves the search token from the search token file.
 * If the search token file doesn't exist, it regenerates the search token.
 * @returns The search token.
 */
function getSearchToken() {
  if (!existsSync(getSearchTokenFilePath())) regenerateSearchToken();
  return readFileSync(getSearchTokenFilePath(), "utf8");
}

let embeddingModelInstance: EmbeddingsModel | undefined;

/**
 * Calculates the similarity scores between a query and a list of documents.
 * @param query The search query.
 * @param documents An array of documents to compare against the query.
 * @returns An array of similarity scores, where each score corresponds to a document in the documents array.
 */
async function getSimilarityScores(query: string, documents: string[]) {
  if (!embeddingModelInstance)
    embeddingModelInstance = await initModel(embeddingModel);

  const [queryEmbedding] = await embeddingModelInstance.embed([query]);

  const documentsEmbeddings = await embeddingModelInstance.embed(documents);

  return documentsEmbeddings.map((documentEmbedding) =>
    calculateSimilarity(queryEmbedding, documentEmbedding),
  );
}

/**
 * Ranks the search results based on their similarity to the search query.
 * @param query The search query.
 * @param searchResults An array of SearchResult objects representing the search results.
 * @returns An array of SearchResult objects ranked by their similarity to the search query.
 */
async function rankSearchResults(query: string, searchResults: SearchResult[]) {
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    return searchResults; // Return the original search results if it's not an array or if it's empty
  }

  try {
    const searchResultToScoreMap: Map<(typeof searchResults)[0], number> =
      new Map();

    (
      await getSimilarityScores(
        query.toLocaleLowerCase(),
        searchResults.map(([title, snippet, url]) =>
          `${title}\n${url}\n${snippet}`.toLocaleLowerCase(),
        ),
      )
    ).forEach((score, index) => {
      searchResultToScoreMap.set(searchResults[index], score);
    });

    return searchResults
      .slice()
      .sort(
        (a, b) => searchResultToScoreMap.get(b) - searchResultToScoreMap.get(a),
      );
  } catch (error) {
    console.error("Error ranking search results:", error);
    return searchResults;
  }
}
