import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { SubscriptionPlan } from "../constants/appInfo.constant";

const stripePromise = loadStripe(SubscriptionPlan.PAYMENT_GATEWAY_PUBLIC_KEY);

interface PaymentGatewayProps {
  onSubmitSuccess: () => void;
  onSubmitError: () => void;
}

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
      <button type="submit">Upgrade to Smarter Plan</button>
    </form>
  );
};
