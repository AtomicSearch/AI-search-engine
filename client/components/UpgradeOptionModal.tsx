import React from 'react';
import styled from 'styled-components';

const ModalWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 300px;
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

const Button = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
`;

export const UpgradeModal = () => {
  const handleButtonClick = () => {
    window.location.href = '/pricing';
  };

  return (
    <ModalWrapper>
      <ModalHeader>
        <Logo>🚀</Logo>
        <Title>Upgrade to Pro</Title>
      </ModalHeader>
      <Description>
        Unlock unlimited searches with advanced models and more
      </Description>
      <Button onClick={handleButtonClick}>Try Now</Button>
    </ModalWrapper>
  );
};
