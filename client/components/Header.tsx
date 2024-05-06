import styled from "styled-components";

import { I18n } from "../constants/appInfo.constant";

const HeaderContainer = styled.header`
  background-color: #282c34;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 32px;
  color: #61dafb;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px 25px;
  border-radius: 20px;
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #20232a;
    transform: scale(1.05);
  }

  span {
    margin-left: 8px;
  }
`;

export const Header = ({ goTo }: { goTo: () => void }) => {
  return (
    <HeaderContainer>
      <Logo onClick={goTo}>
        <span role="img" aria-label="rocket">
          🚀
        </span>
        <span>{I18n.APP_NAME}</span>
      </Logo>
    </HeaderContainer>
  );
};
