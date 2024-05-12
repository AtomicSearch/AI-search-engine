import { FaSketch } from "react-icons/fa";
import styled from "styled-components";
import { BlueButton } from "../atoms/Button.atom";

const ModalWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 180px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Logo = styled.span`
  font-size: 24px;
  margin-right: 8px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const Description = styled.p`
  font-size: 14px;
  margin-bottom: 16px;
`;

export const UpgradePlanModal: React.FC = () => {
  const handleButtonClick = () => {
    window.location.href = "/pricing?from=homepage_modal";
  };

  return (
    <ModalWrapper>
      <ModalHeader>
        <Logo>
          <FaSketch />
        </Logo>
        <Title>Upgrade to Pro</Title>
      </ModalHeader>
      <Description>
        Dive deep into the answers you seek with unlimited latest AI models
      </Description>
      <BlueButton onClick={handleButtonClick}>Try Now</BlueButton>
    </ModalWrapper>
  );
};
