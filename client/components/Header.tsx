import styled from "styled-components";

import { AppInfo } from "../constants/appInfo.constant";

const HeaderContainer = styled.header`
  background-color: #ffffff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #007bff;
  display: flex;
  align-items: center;
  cursor: pointer;

  span {
    margin-left: 8px;
  }
`;

export const Header = () => {
  return (
    <HeaderContainer>
      <Logo onClick={(e) => (location.href = AppInfo.APP_URL)}>
        <span role="img" aria-label="rocket">
          🚀
        </span>
        <span>{AppInfo.APP_NAME}</span>
      </Logo>
    </HeaderContainer>
  );
};
