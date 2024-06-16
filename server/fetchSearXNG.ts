import { strip as stripEmojis } from "node-emoji";
import { convert as convertHtmlToPlainText } from "html-to-text";

import { CategoryEngine, Search } from "../config/appInfo.config";
import { logger } from "./logger";

export async function fetchSearXNG(query: string, limit?: number) {
  try {
    const url = new URL(Search.SEARCH_URL);

    url.search = new URLSearchParams({
      q: query,
      language: "auto",
      safesearch: "0",
      format: "json",
      engine: CategoryEngine.MINIMUM,
    }).toString();

    const response = await fetch(url);

    let { results } = (await response.json()) as {
      results: { url: string; title: string; content: string }[];
    };

    const searchResults: [title: string, content: string, url: string][] = [];

    if (results) {
      if (limit && limit > 0) {
        results = results.slice(0, limit);
      }

      const uniqueUrls = new Set<string>();

      for (const result of results) {
        if (uniqueUrls.has(result.url) || !result.content) {
          continue;
        }

        const title = convertHtmlToPlainText(result.title, {
          wordwrap: false,
        }).trim();

        let content = convertHtmlToPlainText(result.content, {
          wordwrap: false,
        }).trim();

        content = stripEmojis(content, { preserveSpaces: true });

        if (content.includes("...Missing:")) {
          content = `${content.split("...Missing:")[0].trim()}...`;
        }

        if (title === "" || content === "") {
          continue;
        }

        const url = result.url;

        searchResults.push([title, content, url]);

        uniqueUrls.add(url);
      }
    }

    return searchResults;
  } catch (e) {
    logger.error(e);
    return [];
  }
}
