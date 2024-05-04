import React from 'react';
import styled from 'styled-components';
import 'water.css';

const PricingContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
`;

const PricingHeader = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const PricingCard = styled.div`
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const PlanName = styled.h3`
  font-size: 20px;
  margin-bottom: 10px;
`;

const Price = styled.p`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const FeatureList = styled.ul`
  text-align: left;
  margin-bottom: 20px;
`;

const PurchaseButton = styled.a`
  display: inline-block;
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
`;

export const PricingPage = () => {
  return (
    <PricingContainer>
      <PricingHeader>Pricing</PricingHeader>
      <PricingCard>
        <PlanName>Free</PlanName>
        <Price>$0</Price>
        <FeatureList>
          <li>Basic search functionality</li>
          <li>Access to our fundamental language model</li>
        </FeatureList>
      </PricingCard>
      <PricingCard>
        <PlanName>Pro</PlanName>
        <Price>$15/mo</Price>
        <FeatureList>
          <li>Unlimited searches</li>
          <li>Smarter and more accurate Agent Mode</li>
          <li>Advanced language model support</li>
          <li>GitHub integration (Coming soon)</li>
        </FeatureList>
        <PurchaseButton href="">
          Purchase
        </PurchaseButton>
      </PricingCard>
    </PricingContainer>
  );
};
