import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import { SubscriptionPlan } from "../../config/appInfo.config";
import toast, { Toaster } from "react-hot-toast";

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
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  onSubmitSuccess,
  onSubmitError,
}) => {
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    const loadStripeLibrary = async () => {
      try {
        await stripePromise;
        setStripeLoaded(true);
      } catch (error) {
        console.error("Failed to load Stripe.js:", error);
        toast.error("Failed to load Stripe. Please try again later.");
      }
    };

    loadStripeLibrary();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripeLoaded) {
      toast.error("Stripe is still loading. Please wait a moment.");
      return;
    }

    const stripe = await stripePromise;

    if (!stripe) {
      toast.error("Failed to initialize Stripe. Please try again.");
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
        toast.error(`Error: ${error.message}`);
        onSubmitError();
      } else {
        onSubmitSuccess();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      onSubmitError();
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit}>
        <PurchaseButton type="submit" disabled={!stripeLoaded}>
          {stripeLoaded ? "Upgrade to Smarter Plan" : "Loading..."}
        </PurchaseButton>
      </form>
    </>
  );
};
