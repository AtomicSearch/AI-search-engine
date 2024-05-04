import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Confetti from 'react-confetti';

const LEMON_SQUEEZY_CHECKOUT_URL = 'https://your-lemonsqueezy-checkout-url';

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
  position: relative;
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

const Feature = styled.li`
  margin-bottom: 8px;
  position: relative;
  padding-left: 24px;

  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #007bff;
    font-weight: bold;
  }
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

export const PricingPage: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const visited = localStorage.getItem('pricingVisited');
    if (!visited) {
      setShowConfetti(true);
      localStorage.setItem('pricingVisited', 'true');
    }
  }, []);

  return (
    <PricingContainer>
      <PricingHeader>Pricing</PricingHeader>
      <PricingCard>
        <PlanName>Free</PlanName>
        <Price>$0</Price>
        <FeatureList>
          <Feature>Basic search functionality</Feature>
          <Feature>Access to fundamental AI models</Feature>
        </FeatureList>
      </PricingCard>
      <PricingCard ref={confettiRef}>
        <PlanName>Pro</PlanName>
        <Price>$15/mo</Price>
        <FeatureList>
          <Feature>Unlimited searches</Feature>
          <Feature>Smarter results (with access to latest most advance AI models)</Feature>
          <Feature>No ads or trackers</Feature>
          <Feature>100% anonymous</Feature>
        </FeatureList>
        <PurchaseButton href={`${LEMON_SQUEEZY_CHECKOUT_URL}`}>
          Purchase
        </PurchaseButton>
        {showConfetti && confettiRef.current && (
          <Confetti
            numberOfPieces={200}
            recycle={false}
            width={confettiRef.current.offsetWidth}
            height={confettiRef.current.offsetHeight}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        )}
      </PricingCard>
    </PricingContainer>
  );
};
