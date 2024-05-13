import path from "node:path";
import fs, { writeFileSync, readFileSync, existsSync } from "node:fs";
import react from "@vitejs/plugin-react";
import basicSSL from "@vitejs/plugin-basic-ssl";
import { RateLimiterMemory } from "rate-limiter-flexible";
import {
  initModel,
  distance as calculateSimilarity,
  EmbeddingsModel,
} from "@energetic-ai/embeddings";
import temporaryDirectory from "temp-dir";
import Redis from "ioredis";
import { PreviewServer, ViteDevServer, defineConfig } from "vite";
import { modelSource as embeddingModel } from "@energetic-ai/model-embeddings-en";
import { CategoryEngine } from "./appInfo.config";

const REDIS_CACHE_EXPIRATION_TIME_SECONDS = 3600; // 1 hour
const RATE_LIMITER_OPTIONS = {
  points: 10, // Maximum number of requests allowed within the duration
  duration: 5, // Duration in seconds
};

interface SearchResult {
  title: string;
  content: string;
  url: string;
}

class RedisAdapter {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
    });
  }

  /**
   * Retrieves the value associated with the given key from Redis.
   * @param key The key to retrieve the value for.
   * @returns The value associated with the key, or null if the key doesn't exist.
   */
  async get(key: string): Promise<string | null> {
    try {
      const value = await this.redisClient.get(key);
      return value;
    } catch (error) {
      console.error("Error retrieving data from Redis:", error);
      return null;
    }
  }

  /**
   * Sets the value associated with the given key in Redis.
   * @param key The key to set the value for.
   * @param value The value to set.
   * @param expirationTime (Optional) The expiration time for the key-value pair in seconds.
   */
  async set(
    key: string,
    value: string,
    expirationTime?: number,
  ): Promise<void> {
    try {
      if (expirationTime) {
        await this.redisClient.set(key, value, "EX", expirationTime);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      console.error("Error storing data in Redis:", error);
    }
  }
}

const isRedisCacheEnabled = process.env.IS_REDIS_CACHE_ENABLED === "true";
const redisAdapter = isRedisCacheEnabled ? new RedisAdapter() : undefined;

const serverStartTime = new Date().getTime();
let searchCountSinceLastRestart = 0;

export default defineConfig(({ command }) => {
  if (command === "build") {
    regenerateSearchToken();
  }

  updateWllamaPThreadPoolSize();

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
      react(),
      {
        name: "configure-server-cross-origin-isolation",
        configureServer: configureServerCrossOriginIsolation,
        configurePreviewServer: configureServerCrossOriginIsolation,
      },
      {
        name: "configure-server-search-endpoint",
        configureServer: configureServerSearchEndpoint,
        configurePreviewServer: configureServerSearchEndpoint,
      },
      {
        name: "configure-server-status-endpoint",
        configureServer: configureServerStatusEndpoint,
        configurePreviewServer: configureServerStatusEndpoint,
      },
      {
        name: "configure-server-cache",
        configurePreviewServer: configureServerCache,
      },
    ],
  };
});

function configureServerCrossOriginIsolation<
  T extends ViteDevServer | PreviewServer,
>(server: T) {
  server.middlewares.use((_, response, next) => {
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

function configureServerStatusEndpoint<T extends ViteDevServer | PreviewServer>(
  server: T,
) {
  server.middlewares.use(async (request, response, next) => {
    if (!request.url.startsWith("/status")) return next();

    const secondsSinceLastRestart = Math.floor(
      (new Date().getTime() - serverStartTime) / 1000,
    );

    response.end(
      JSON.stringify({
        secondsSinceLastRestart,
        searchCountSinceLastRestart,
        searchesPerSecond:
          searchCountSinceLastRestart / secondsSinceLastRestart,
      }),
    );
  });
}

function configureServerSearchEndpoint<T extends ViteDevServer | PreviewServer>(
  server: T,
) {
  const rateLimiter = new RateLimiterMemory(RATE_LIMITER_OPTIONS);

  server.middlewares.use(async (request, response, next) => {
    if (!request.url.startsWith("/search")) {
      return next();
    }

    const url = `https://${request.headers.host}`;
    const { searchParams } = new URL(request.url, url);

    const token = searchParams.get("token");

    if (!token || token !== getSearchToken()) {
      response.statusCode = 401;
      response.end("Unauthorized.");
      return;
    }

    const query = searchParams.get("q");

    if (!query) {
      response.statusCode = 400;
      response.end("Missing the query parameter.");
      return;
    }

    const limitParam = searchParams.get("limit");
    const limit =
      limitParam && Number(limitParam) > 0 ? Number(limitParam) : undefined;

    try {
      const remoteAddress = (
        (request.headers["x-forwarded-for"] as string) ||
        request.socket.remoteAddress ||
        "unknown"
      )
        .split(",")[0]
        .trim();

      await rateLimiter.consume(remoteAddress);
    } catch (error) {
      response.statusCode = 429;
      response.end("Too many requests.");
      return;
    }

    let searchResults: SearchResult[] | null = null;

    if (isRedisCacheEnabled) {
      const cachedResults = await redisAdapter?.get(query);
      if (cachedResults) {
        try {
          searchResults = JSON.parse(cachedResults);
        } catch (error) {
          console.error("Error parsing JSON data from Redis:", error);
        }
      }
    }

    if (!searchResults) {
      const fetchedResults = await fetchSearXNG(query, limit);
      searchResults = fetchedResults;

      if (isRedisCacheEnabled) {
        await redisAdapter?.set(
          query,
          JSON.stringify(searchResults),
          REDIS_CACHE_EXPIRATION_TIME_SECONDS,
        );
      }
    }

    searchCountSinceLastRestart++;

    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      response.end(JSON.stringify([]));
      return;
    }

    try {
      const rankedResults = await rankSearchResults(query, searchResults);
      response.end(JSON.stringify(rankedResults));
    } catch (error) {
      console.error("Error ranking search results:", error);
      response.end(JSON.stringify(searchResults));
    }
  });
}

function configureServerCache<T extends ViteDevServer | PreviewServer>(
  server: T,
) {
  server.middlewares.use(async (request, response, next) => {
    if (
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
): Promise<SearchResult[]> {
  try {
    const url = new URL("http://127.0.0.1:8080/search");

    url.search = new URLSearchParams({
      q: query,
      language: "auto",
      safesearch: "0",
      format: "json",
      //engine: supportedEngines,
      engine: CategoryEngine.RESEARCH,
      timeout: "10000", // Set a timeout of 10 seconds
    }).toString();

    const response = await fetch(url);

    let { results } = (await response.json()) as {
      results: { url: string; title: string; content: string }[];
    };

    const searchResults: SearchResult[] = [];

    if (results) {
      if (limit && limit > 0) {
        results = results.slice(0, limit);
      }

      const uniqueUrls = new Set<string>();

      for (const result of results) {
        if (!result.content || uniqueUrls.has(result.url)) continue;

        const stripHtmlTags = (str: string) => str.replace(/<[^>]*>?/gm, "");

        const content = stripHtmlTags(result.content).trim();

        if (content === "") continue;

        const title = stripHtmlTags(result.title);
        const url = result.url;

        searchResults.push({ title, content, url });
        uniqueUrls.add(url);
      }
    }

    return searchResults;
  } catch (e) {
    console.error("Error fetching search results from SearXNG:", e);
    return [];
  }
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
    return searchResults;
  }

  try {
    const scores = await getSimilarityScores(
      query.toLocaleLowerCase(),
      searchResults.map(({ title, content, url }) =>
        `${title}\n${url}\n${content}`.toLocaleLowerCase(),
      ),
    );

    const searchResultToScoreMap: Map<SearchResult, number> = new Map();

    scores.map((score, index) =>
      searchResultToScoreMap.set(searchResults[index], score ?? 0),
    );

    return searchResults
      .slice()
      .sort(
        (a, b) =>
          (searchResultToScoreMap.get(b) ?? 0) -
          (searchResultToScoreMap.get(a) ?? 0),
      );
  } catch (error) {
    console.error("Error ranking search results:", error);
    return searchResults;
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

/**
 * Updates the pthread pool size in the multi-thread wllama.js file.
 * The pthread pool size is set to the maximum of (number of CPU cores - 2) and 2.
 */
function updateWllamaPThreadPoolSize() {
  const multiThreadWllamaJsPath = path.resolve(
    __dirname,
    "node_modules/@wllama/wllama/esm/multi-thread/wllama.js",
  );

  fs.writeFileSync(
    multiThreadWllamaJsPath,
    fs
      .readFileSync(multiThreadWllamaJsPath, "utf8")
      .replace(
        /pthreadPoolSize=[0-9]+;/g,
        "pthreadPoolSize=Math.max(navigator.hardwareConcurrency - 2, 2);",
      ),
  );
}
