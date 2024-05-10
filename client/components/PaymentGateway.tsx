import React from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import { SubscriptionPlan } from "../constants/appInfo.constant";

const stripePromise = loadStripe(SubscriptionPlan.PAYMENT_GATEWAY_PUBLIC_KEY);

interface PaymentGatewayProps {
  onSubmitSuccess: () => void;
  onSubmitError: () => void;
}

export const PurchaseButton = styled.button`
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

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  onSubmitSuccess,
  onSubmitError,
}) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const stripe = await stripePromise;

    if (!stripe) {
      onSubmitError();
      return;
    }

    try {
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: SubscriptionPlan.PRICE_ID, quantity: 1 }],
        mode: "subscription",
        successUrl: "/success",
        cancelUrl: "/cancel",
      });

      if (error) {
        onSubmitError();
      } else {
        onSubmitSuccess();
      }
    } catch (error) {
      onSubmitError();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PurchaseButton type="submit">Upgrade to Smarter Plan</PurchaseButton>
    </form>
  );
};
