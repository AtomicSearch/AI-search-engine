import featureFlags from "../config/feature-flags.json";

type FeatureFlagProps = {
  [key: string]: {
    [key: string]: boolean;
  };
};

export const loadFeatureFlags = (): FeatureFlagProps => {
  return featureFlags;
};
