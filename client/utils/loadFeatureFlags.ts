import featureFlags from "../../config/feature-flags.json";

type FeatureFlag = {
  enabled: boolean;
  [key: string]: unknown;
};

type FeatureFlags = {
  [key: string]: FeatureFlag;
};

export const loadFeatureFlags = (): FeatureFlags => {
  return featureFlags;
};
