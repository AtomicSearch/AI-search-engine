import { useState, useEffect } from "react";
import { SubscriptionPlan } from "../constants/appInfo.constant";

export const useSubscriptionStatus = (): boolean => {
  const [isUserSubscribed, setIsUserSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const subscriptionStatus = localStorage.getItem("subscriptionStatus");
    setIsUserSubscribed(subscriptionStatus === SubscriptionPlan.ACTIVE_STATUS);
  }, []);

  // TODO Make a secure API call to fetch the subscription status instead of using localStorage
  // useEffect(() => {
  //   const fetchSubscriptionStatus = async () => {
  //     try {
  //       // Make a secure API call to fetch the subscription status
  //       const response = await fetch("/api/subscriptionStatus", {
  //         method: "GET",
  //         credentials: "same-origin", // Send cookies for authentication
  //       });

  //       if (response.ok) {
  //         const data = await response.json();
  //         const subscriptionStatus = data.status;

  //         // Validate and sanitize the subscription status
  //         if (subscriptionStatus === SubscriptionPlan.ACTIVE_STATUS) {
  //           setIsUserSubscribed(true);
  //         } else {
  //           setIsUserSubscribed(false);
  //         }
  //       } else {
  //         // Handle error case
  //         setIsUserSubscribed(false);
  //       }
  //     } catch (error) {
  //       // Handle error case
  //       setIsUserSubscribed(false);
  //     }
  //   };

  //   fetchSubscriptionStatus();
  // }, []);

  return isUserSubscribed;
};
