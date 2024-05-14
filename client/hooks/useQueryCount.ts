import { useEffect, useState } from "react";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { Search } from "../../config/appInfo.config";

export const useQueryCount = () => {
  const [queryCount, setQueryCount] = useState<number>(0);
  const [isQueryLimitReached, setIsQueryLimitReached] =
    useState<boolean>(false);
  const isUserSubscribed = useSubscriptionStatus();

  useEffect(() => {
    const storedQueryCount = localStorage.getItem("queryCount");
    if (storedQueryCount) {
      setQueryCount(parseInt(storedQueryCount, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("queryCount", queryCount.toString());
    setIsQueryLimitReached(
      queryCount >= Search.MAXIMUM_FREE_QUERIES_PER_HOUR && !isUserSubscribed,
    );
  }, [queryCount, isUserSubscribed]);

  const incrementQueryCount = () => {
    setQueryCount((prevCount) => prevCount + 1);
  };

  return { queryCount, incrementQueryCount, isQueryLimitReached };
};
