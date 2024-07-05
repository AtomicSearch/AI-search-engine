import { loadFeatureFlags } from "../../utils/load-feature-flags";

export const usePaymentGatewayFeatureFlag = (): boolean => {
  const featureFlags = loadFeatureFlags();

  return featureFlags.paymentGateway.enabled;
};
