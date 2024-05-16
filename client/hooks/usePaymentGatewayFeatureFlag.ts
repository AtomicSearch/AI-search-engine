import { loadFeatureFlags } from "../../utils/loadFeatureFlags";

export const usePaymentGatewayFeatureFlag = (): boolean => {
  const featureFlags = loadFeatureFlags();

  return featureFlags.paymentGateway.enabled;
};
