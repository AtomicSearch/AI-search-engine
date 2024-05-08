import styled from "styled-components";
import { FaSearch } from "react-icons/fa";
import { AppInfo } from "../../constants/appInfo.constant";

const TaglineContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const TaglineIcon = styled(FaSearch)`
  font-size: 24px;
  margin-right: 10px;
  color: #0066cc;
`;

const TaglineText = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

export const Tagline = () => {
  return (
    <TaglineContainer>
      <TaglineIcon />
      <TaglineText>{AppInfo.APP_TAGLINE}</TaglineText>
    </TaglineContainer>
  );
};
