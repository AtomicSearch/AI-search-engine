import { PreviewServer, ViteDevServer } from "vite";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { StatusCodes } from "http-status-codes";
import { argon2Verify } from "hash-wasm";

import { incrementSearchesSinceLastRestart } from "./searchesSinceLastRestart";
import { rankSearchResults } from "./rankSearchResults";
import { getSearchToken } from "./searchToken";
import { fetchSearXNG } from "./fetchSearXNG";
import { isVerifiedToken, addVerifiedToken } from "./verifiedTokens";

export function searchEndpointServerHook<
  T extends ViteDevServer | PreviewServer,
>(server: T) {
  const rateLimiter = new RateLimiterMemory({
    points: 2,
    duration: 10,
  });

  server.middlewares.use(async (request, response, next) => {
    if (!request.url?.startsWith("/search")) return next();

    const { searchParams } = new URL(
      request.url,
      `http://${request.headers.host}`,
    );

    const limitParam = searchParams.get("limit");

    const limit =
      limitParam && Number(limitParam) > 0 ? Number(limitParam) : undefined;

    const query = searchParams.get("q");

    if (!query) {
      response.statusCode = StatusCodes.BAD_REQUEST;
      response.end("Missing the query parameter.");
      return;
    }

    const token = searchParams.get("token");

    if (!isVerifiedToken(token)) {
      let isValidToken = false;

      try {
        isValidToken = await argon2Verify({
          password: getSearchToken(),
          hash: token,
        });
      } catch (error: unknown) {
        console.log(error);
        void error;
      }

      if (isValidToken) {
        addVerifiedToken(token);
      } else {
        response.statusCode = StatusCodes.UNAUTHORIZED;
        response.end("Unauthorized.");
        return;
      }
    }

    try {
      await rateLimiter.consume(token);
    } catch (error: unknown) {
      response.statusCode = StatusCodes.TOO_MANY_REQUESTS;
      response.end("Too many requests.");
      return;
    }

    const searchResults = await fetchSearXNG(query, limit);

    incrementSearchesSinceLastRestart();

    if (searchResults.length === 0) {
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify([]));
      return;
    }

    try {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify(await rankSearchResults(query, searchResults)),
      );
    } catch (error: unknown) {
      console.error("Error ranking search results:", error);
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(searchResults));
    }
  });
}
