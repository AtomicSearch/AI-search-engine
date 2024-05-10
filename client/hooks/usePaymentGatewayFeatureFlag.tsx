import { useState, useEffect } from "react";
import { loadFeatureFlags } from "../utils/loadFeatureFlags";

export const usePaymentGatewayFeatureFlag = (): boolean => {
  const [isPaymentGatewayEnabled, setIsPaymentGatewayEnabled] = useState<boolean>(false);

  useEffect(() => {
    const featureFlags = loadFeatureFlags();
    setIsPaymentGatewayEnabled(featureFlags.paymentGateway.enabled);
  }, []);

  return isPaymentGatewayEnabled;
};
