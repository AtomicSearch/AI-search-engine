import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Confetti from "react-confetti";
import confetti from "canvas-confetti";
import { Toaster } from "react-hot-toast";
import "react-phone-number-input/style.css";
import {
  FaSearch,
  FaClock,
  FaShieldAlt,
  FaSearchengin,
  FaRegLightbulb,
  FaRegPaperPlane,
  FaLockOpen,
} from "react-icons/fa";
import {
  TbInfinity,
  TbInfinityOff,
  TbRocket,
  TbRocketOff,
} from "react-icons/tb";
import toast from "react-hot-toast";

import { LocalStorageKeys } from "../../constants/localStorages.constant";
import { Footer } from "../../components/Footer";
import { NotifyMeModal } from "../../components/modals/NotifyMeModal";
import { confettiOptions } from "../../constants/confettiOptions.constant";

const PricingContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;

  @media (max-width: 600px) {
    padding: 10px;
  }
`;

const PricingHeader = styled.h1`
  margin-bottom: 8px;

  @media (max-width: 600px) {
    font-size: 24px;
  }
`;

const PricingSubHeader = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    font-size: 18px;
  }
`;

const PricingCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    margin-bottom: 20px;
  }
`;

const PricingCard = styled.div`
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  margin: 10px;
  flex: 1 1 300px;
  max-width: 400px;
  position: relative;

  @media (max-width: 600px) {
    padding: 15px;
    margin: 5px;
  }
`;

const PlanName = styled.h3`
  font-size: 20px;
  margin-bottom: 10px;

  @media (max-width: 600px) {
    font-size: 18px;
  }
`;

const Price = styled.p`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;

  @media (max-width: 600px) {
    font-size: 20px;
  }
`;

const FeatureList = styled.ul`
  text-align: center;
  margin-bottom: 20px;
  padding: 0;
  list-style-type: none;

  @media (max-width: 600px) {
    margin-bottom: 15px;
  }
`;

const Feature = styled.li`
  font-size: 18px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    margin-right: 8px;
    color: #007bff;
  }

  @media (max-width: 600px) {
    font-size: 16px;
  }
`;

const PurchaseButton = styled.button`
  display: inline-block;
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  border: none;
  cursor: pointer;

  @media (max-width: 600px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const BenefitsList = styled.ul`
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Benefit = styled.li`
  font-size: 18px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  svg {
    margin-right: 12px;
    color: #007bff;
  }

  @media (max-width: 600px) {
    font-size: 16px;
    margin-bottom: 12px;
  }
`;

export const PricingPage: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLDivElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem(LocalStorageKeys.PRICING_VISITED);
    if (!visited) {
      setShowConfetti(true);
      localStorage.setItem(LocalStorageKeys.PRICING_VISITED, "true");
    }
  }, []);

  const handleNotifyMeClick = () => {
    confetti(confettiOptions);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleSubmitSuccess = () => {
    setShowModal(false);
    toast("Amazing! We'll notify you when the Smart plan is available.", {
      position: "top-right",
      duration: 5000,
      icon: "🎉",
    });
  };

  const handleSubmitError = () => {
    toast.error("Oops! Something went wrong. Please try again later.", {
      position: "top-right",
      duration: 5000,
    });
  };

  return (
    <>
      <PricingContainer>
        <PricingHeader>Goodbye doubts. Hello certainties.</PricingHeader>
        <PricingSubHeader>
          <FaLockOpen /> Unlock Full Knowledge with Smarter Plan
        </PricingSubHeader>
        <PricingCardContainer>
          <PricingCard>
            <PlanName>
              <FaRegPaperPlane /> Basic
            </PlanName>
            <Price>$0</Price>
            <FeatureList>
              <Feature>
                <TbInfinityOff />
                Limited words per query
              </Feature>
              <Feature>
                <TbRocketOff />
                Access to basic AI models
              </Feature>
            </FeatureList>
          </PricingCard>
          <PricingCard ref={confettiRef}>
            <PlanName>
              <FaRegLightbulb /> Smarter
            </PlanName>
            <Price>$17/mo</Price>
            <FeatureList>
              <Feature>
                <TbInfinity />
                Fuel your growth with unlimited searches
              </Feature>
              <Feature>
                <FaSearchengin />
                Get string accuracy rate for every query
              </Feature>
              <Feature>
                <TbRocket />
                Take advantage of the most advanced AI models
              </Feature>
              <Feature>
                <FaShieldAlt />
                Enjoy a distraction-free, fully secure, and private search
                experience
              </Feature>
            </FeatureList>
            <PurchaseButton onClick={handleNotifyMeClick}>
              Get Notified. Upgrade when ready.
            </PurchaseButton>
            {showConfetti && confettiRef.current && (
              <Confetti
                numberOfPieces={200}
                recycle={false}
                width={confettiRef.current.offsetWidth}
                height={confettiRef.current.offsetHeight}
                style={{ position: "absolute", top: 0, left: 0 }}
              />
            )}
          </PricingCard>
        </PricingCardContainer>
        <BenefitsList>
          <Benefit>
            <FaSearch />
            Stay ahead of the curve with predictive insights
          </Benefit>
          <Benefit>
            <FaClock />
            Accelerate your workflow and achieve more in less time
          </Benefit>
          <Benefit>
            <FaShieldAlt />
            Gain a competitive edge while maintaining complete privacy
          </Benefit>
        </BenefitsList>
      </PricingContainer>

      <Footer hasEmptyResults={false} />

      <NotifyMeModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmitSuccess={handleSubmitSuccess}
        onSubmitError={handleSubmitError}
      />
      <Toaster />
    </>
  );
};
