import { useState, useEffect } from "react";

export const useSubscriptionStatus = () => {
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    setIsUserSubscribed(subscriptionStatus === "active");
  }, []);

  return isUserSubscribed;
};
