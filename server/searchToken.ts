import { readFileSync, existsSync, writeFileSync } from "node:fs";
import temporaryDirectory from "temp-dir";
import path from "node:path";

function getSearchTokenFilePath() {
  return path.resolve(temporaryDirectory, "minisearch-token");
}

export const getSearchToken = () => {
  if (!existsSync(getSearchTokenFilePath())) {
    regenerateSearchToken();
  }

  return readFileSync(getSearchTokenFilePath(), "utf8");
};

export function regenerateSearchToken() {
  const newToken = Math.random().toString(36).substring(2);
  writeFileSync(getSearchTokenFilePath(), newToken);
}
