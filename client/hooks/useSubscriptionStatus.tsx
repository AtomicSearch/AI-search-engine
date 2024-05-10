import { useState, useEffect } from "react";
import { SubscriptionPlan } from "../constants/appInfo.constant";

export const useSubscriptionStatus = (): boolean => {
  const [isUserSubscribed, setIsUserSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    setIsUserSubscribed(subscriptionStatus === SubscriptionPlan.ACTIVE_STATUS);
  }, []);

  return isUserSubscribed;
};
