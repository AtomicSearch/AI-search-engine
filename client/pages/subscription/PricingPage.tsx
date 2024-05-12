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
  FaDatabase,
  FaRegDotCircle,
} from "react-icons/fa";
import {
  TbInfinity,
  TbInfinityOff,
  TbRocket,
  TbRocketOff,
  TbSpyOff
} from "react-icons/tb";
import toast from "react-hot-toast";

import { LocalStorageKeys } from "../../constants/localStorages.constant";
import { Footer } from "../../components/Footer";
import { NotifyMeModal } from "../../components/modals/NotifyMeModal";
import { confettiOptions } from "../../constants/confettiOptions.constant";
import {
  PaymentGateway,
  PurchaseButton,
} from "../../components/PaymentGateway";
import { AppInfo, SubscriptionPlan } from "../../constants/appInfo.constant";
import { usePaymentGatewayFeatureFlag } from "../../hooks/usePaymentGatewayFeatureFlag";
import { Millisecond } from "../../constants/time.constant";

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

const LockOpenIcon = styled(FaLockOpen)`
  font-size: 18px;
  margin-right: 8px;
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

const PaperPlaneIcon = styled(FaRegPaperPlane)`
  font-size: 18px;
  margin-right: 8px;
`;

const LightbulbIcon = styled(FaRegLightbulb)`
  font-size: 18px;
  margin-right: 8px;
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
  margin-bottom: 10px;
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

const InfinityOffIcon = styled(TbInfinityOff)`
  font-size: 18px;
`;

const RocketOffIcon = styled(TbRocketOff)`
  font-size: 18px;
`;

const InfinityIcon = styled(TbInfinity)`
  font-size: 18px;
`;

const SearchenginIcon = styled(FaSearchengin)`
  font-size: 18px;
`;

const RocketIcon = styled(TbRocket)`
  font-size: 18px;
`;

const SpyOffIcon = styled(TbSpyOff)`
  font-size: 18px;
`;

const ShieldIcon = styled(FaShieldAlt)`
  font-size: 18px;
`;

const DatabaseIcon = styled(FaDatabase)`
  font-size: 18px;
`;

const DartIcon = styled(FaRegDotCircle)`
  font-size: 18px;
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

const SearchIcon = styled(FaSearch)`
  font-size: 18px;
`;

const ClockIcon = styled(FaClock)`
  font-size: 18px;
`;

export const PricingPage: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<HTMLDivElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const isPaymentGatewayEnabled = usePaymentGatewayFeatureFlag();

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

  const handleSubmitWaitingListSuccess = () => {
    setShowModal(false);
    toast("Amazing! We'll notify you when the Smart plan is available.", {
      position: "top-right",
      duration: Millisecond.FIVE_SECOND,
      icon: "🎉",
    });
  };

  const handleSubmitSubscriptionSuccess = () => {
    setShowModal(false);
    localStorage.setItem("subscriptionStatus", "active");
    toast("Congratulations! You are now subscribed to the Smarter plan.", {
      position: "top-right",
      duration: Millisecond.FIVE_SECOND,
      icon: "🎉",
    });
  };

  const handleSubmitError = () => {
    toast.error("Oops! Something went wrong. Please try again later.", {
      position: "top-right",
      duration: Millisecond.FIVE_SECOND,
    });
  };

  return (
    <>
      <PricingContainer>
        <PricingHeader>Goodbye doubts. Hello certainties.</PricingHeader>
        <PricingSubHeader>
          <LockOpenIcon /> Unlock Full Knowledge with Smarter Plan
        </PricingSubHeader>
        <PricingCardContainer>
          <PricingCard>
            <PlanName>
              <PaperPlaneIcon /> Basic
            </PlanName>
            <Price>$0</Price>
            <FeatureList>
              <Feature>
                <InfinityOffIcon />
                Limited words per query
              </Feature>
              <Feature>
                <RocketOffIcon />
                Access to basic AI models
              </Feature>
            </FeatureList>
          </PricingCard>
          <PricingCard ref={confettiRef}>
            <PlanName>
              <LightbulbIcon /> Smarter
            </PlanName>
            <Price>{SubscriptionPlan.PRICE_DISPLAYED}</Price>
            <FeatureList>
              <Feature>
                <InfinityIcon />
                Fuel your growth with unlimited searches
              </Feature>
              <Feature>
                <SearchenginIcon />
                Get string accuracy rate for every query
              </Feature>
              <Feature>
                <RocketIcon />
                Take advantage of the most advanced AI models
              </Feature>
              <Feature>
                <ShieldIcon />
                Enjoy a distraction-free, fully secure, and private search
                experience
              </Feature>
            </FeatureList>
            {isPaymentGatewayEnabled ? (
              <PaymentGateway
                onSubmitSuccess={handleSubmitSubscriptionSuccess}
                onSubmitError={handleSubmitError}
              />
            ) : (
              <PurchaseButton onClick={handleNotifyMeClick}>
                Get Notified. Upgrade when ready.
              </PurchaseButton>
            )}
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
            <SearchIcon />
            Stay ahead of the curve with predictive insights
          </Benefit>
          <Benefit>
            <ClockIcon />
            Accelerate your workflow and achieve more in less time
          </Benefit>
          <Benefit>
            <ShieldIcon />
            Gain a competitive edge while maintaining complete privacy
          </Benefit>
          <Benefit>
            <SpyOffIcon />
            Ad-free and privacy-focused. {AppInfo.APP_NAME} works on subscription-based model
          </Benefit>
        <Benefit>
            <DatabaseIcon />
            Gives the sources to all your queries. Ideal for academic papers and thesis
          </Benefit>
          <Benefit>
            <DartIcon />
            <strong>{AppInfo.APP_NAME} is all about accuracy</strong>. Fewer results. Better accuracy.
          </Benefit>
        </BenefitsList>
      </PricingContainer>

      <Footer hasEmptyResults={false} />

      <NotifyMeModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmitSuccess={handleSubmitWaitingListSuccess}
        onSubmitError={handleSubmitError}
      />
      <Toaster />
    </>
  );
};
