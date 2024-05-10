import { useState, useEffect } from "react";

export const useSubscriptionStatus = (): boolean => {
  const [isUserSubscribed, setIsUserSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    setIsUserSubscribed(subscriptionStatus === "active");
  }, []);

  return isUserSubscribed;
};
