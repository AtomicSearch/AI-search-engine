import styled from "styled-components";
import { FaSearchengin } from "react-icons/fa";
import { AppInfo } from "../../constants/appInfo.constant";

const TaglineContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const TaglineIcon = styled(FaSearchengin)`
  font-size: 24px;
  margin-left: 8px;
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
      <TaglineText>{AppInfo.APP_TAGLINE}</TaglineText> <TaglineIcon />
    </TaglineContainer>
  );
};
