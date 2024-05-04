import styled, { css } from "styled-components"
import { SearchResults } from "../modules/search";

interface FooterInfoWrapperProps {
  isEmpty: boolean;
}

const FooterInfoWrapper = styled.div<FooterInfoWrapperProps>`
  display: flex;
  justify-content: center;

  ${props =>
    props.isEmpty &&
    css`
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    `}
`;

const Slogan = styled.div`
  margin-bottom: .5rem;
`

export const FooterInfo = ({ searchResults }: { searchResults: SearchResults }) => {
  return (
    <FooterInfoWrapper isEmpty={searchResults.length === 0}>
    <Slogan>
      <em>The Simplest. But The Most Relevant</em>
    </Slogan>
    </FooterInfoWrapper>
  );
};
