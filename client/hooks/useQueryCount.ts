import { LocalStorageKeys } from "./../constants/localStorages.constant";
import { useEffect, useState } from "react";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { Search } from "../../config/appInfo.config";

export const useQueryCount = () => {
  const [queryCount, setQueryCount] = useState<number>(0);
  const [isQueryLimitReached, setIsQueryLimitReached] =
    useState<boolean>(false);

  const isUserSubscribed = useSubscriptionStatus();

  useEffect(() => {
    const storedQueryCount = localStorage.getItem(LocalStorageKeys.QUERY_COUNT);

    if (storedQueryCount) {
      setQueryCount(parseInt(storedQueryCount, 10));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.QUERY_COUNT, queryCount.toString());
    const isQueryReached = queryCount >= Search.MAXIMUM_FREE_QUERIES_PER_HOUR;
    setIsQueryLimitReached(isQueryReached && !isUserSubscribed);
  }, [queryCount, isUserSubscribed]);

  const incrementQueryCount = () => {
    setQueryCount((prevCount) => prevCount + 1);
  };

  return { queryCount, incrementQueryCount, isQueryLimitReached };
};
