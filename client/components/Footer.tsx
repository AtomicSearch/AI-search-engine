import { FaBrain, FaHeart } from "react-icons/fa";
import styled, { css } from "styled-components";

import { AppInfo, XInfo, GitHubInfo } from "../constants/appInfo.constant";
import { random } from "../utils/random";

interface FooterContainerProps {
  $isEmpty: boolean;
}

const FooterContainer = styled.footer<FooterContainerProps>`
  display: flex;
  justify-content: center;
  color: #888;
  margin-top: 10%;

  ${(props) =>
    props.$isEmpty &&
    css`
      z-index: -1;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
    `}
`;

const Slogan = styled.div`
  margin-bottom: 0.5rem;
  font-size: 14px;
  color: #888;
`;

export const Footer = ({
  hasEmptyResults = true,
}: {
  hasEmptyResults?: boolean;
}) => {
  const authorLinks = [
    <a
      href={GitHubInfo.AUTHOR_GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {GitHubInfo.AUTHOR_GITHUB_HANDLE}
    </a>,
    <a href={XInfo.AUTHOR_X_URL} target="_blank" rel="noopener noreferrer">
      {XInfo.AUTHOR_X_HANDLE}
    </a>,
  ];

  const pickedUpAuthorLink = random(authorLinks);

  return (
    <FooterContainer $isEmpty={hasEmptyResults}>
      <Slogan>
        <em>
          Simplest. Reliable. Secure. Anonymous. Powered by AI <FaBrain />
        </em>
        <br />
        {AppInfo.APP_NAME} &bull; Brought with <FaHeart /> by {pickedUpAuthorLink}
      </Slogan>
    </FooterContainer>
  );
};
