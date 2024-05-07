import styled from "styled-components";

import { AppInfo } from "../constants/appInfo.constant";

const HeaderContainer = styled.header`
  background-color: #f0f0f0;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  border-radius: 30px;
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-bottom: 10px;
  border-radius: 30px;
  transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;

  &:hover {
    background-color: #f5f5f5;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
        <span>{AppInfo.APP_NAME}</span>
      </Logo>
    </HeaderContainer>
  );
};
