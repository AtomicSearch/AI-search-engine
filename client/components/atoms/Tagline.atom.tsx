import styled from "styled-components";
import { FaSearch, FaSearchengin } from "react-icons/fa";

import { random } from "../../utils/random";
import { taglines } from "../../../config/taglines.config";

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

const pickedUpTagline = random(taglines);
const pickedUpIcons = random(icons);

export const Tagline = () => {
  return (
    <TaglineContainer>
      <TaglineText>{pickedUpTagline}</TaglineText> {pickedUpIcons}
    </TaglineContainer>
  );
};
