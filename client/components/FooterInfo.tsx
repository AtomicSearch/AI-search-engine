import { FaBrain, FaHeart } from "react-icons/fa";
import styled, { css } from "styled-components";
import { SearchResults } from "../modules/search";
import { GitHubInfo } from "../constants/appInfo.constant";

interface FooterInfoWrapperProps {
  isEmpty: boolean;
}

const FooterInfoWrapper = styled.div<FooterInfoWrapperProps>`
  display: flex;
  justify-content: center;
  z-index: -1;

  ${(props) =>
    props.isEmpty &&
    css`
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    `}
`;

const Slogan = styled.div`
  margin-bottom: 0.5rem;
  font-size: 14px;
  color: #888;
`;

export const FooterInfo = ({
  searchResults = [],
}: {
  searchResults?: SearchResults;
}) => {
  return (
    <FooterInfoWrapper isEmpty={searchResults.length === 0}>
      <Slogan>
        <em>The Simplest. Reliable by Design <FaBrain /></em> – Brought with <FaHeart /> by{" "}
        <a href={`${GitHubInfo.AUTHOR_GITHUB_URL}`}>{GitHubInfo.AUTHOR_GITHUB_HANDLE}</a>
      </Slogan>
    </FooterInfoWrapper>
  );
};
