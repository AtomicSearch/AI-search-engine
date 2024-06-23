import styled from "styled-components";
import { FaSearch, FaSearchengin } from "react-icons/fa";
import { random } from "../../../utils/random";
import { taglines } from "../../../config/taglines.config";
import { useMemo } from "react";

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

export const Tagline = () => {
  const pickedUpTagline = useMemo(() => random(taglines), []) as string;
  const pickedUpIcons = useMemo(() => random(icons), []) as JSX.Element;

  return (
    <TaglineContainer>
      <TaglineText>{pickedUpTagline}</TaglineText> {pickedUpIcons}
    </TaglineContainer>
  );
};
