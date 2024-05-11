import styled from "styled-components";
import { FaSearch, FaSearchengin } from "react-icons/fa";

import { AppInfo } from "../../constants/appInfo.constant";
import { random } from "../../utils/random";

const TaglineContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const SearchIcon = styled(FaSearch)`
  font-size: 20px;
  margin-left: 8px;
  color: #0066cc;
`;

const SearchenginIcon = styled(FaSearchengin)`
  font-size: 24px;
  margin-left: 8px;
  color: #0066cc;
`;

const TaglineText = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const icons = [<SearchenginIcon />, <SearchIcon />];

const taglines = [
  AppInfo.APP_TAGLINE, // default principal tagline
  "The knowledge for every decision",
  "Rapid. Reliable. AI-first search engine",
  "One-click search. No time wasted",
  "Gives only the relevant URLs for all inquiries",
  "Productivity efficiency guaranteed",
  "The engine that saves people time",
  "AI-powered search engine",
  "Grab the information you need on the go",
  "AI-first knowledge engine",
  "Fast. Reliable. Naturally Smart",
  "Time-saver for all your inquiries",
  "Stop to generic results. Receive domain-specific answers",
];

const pickedUpTagline = random(taglines);
const pickedUpIcons = random(icons);

export const Tagline = () => {
  return (
    <TaglineContainer>
      <TaglineText>{pickedUpTagline}</TaglineText> {pickedUpIcons}
    </TaglineContainer>
  );
};
