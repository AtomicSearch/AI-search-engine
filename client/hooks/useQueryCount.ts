import { LocalStorageKeys } from "./../constants/localStorages.constant";
import { useEffect, useState } from "react";
import { useSubscriptionStatus } from "./useSubscriptionStatus";
import { Search } from "../../config/appInfo.config";
import { Millisecond } from "../constants/time.constant";

interface QueryData {
  count: number;
  timestamp: number;
}

/**
 * Custom hook for managing query count and limit.
 *
 * @returns {object} An object containing the following properties:
 *   - queryCount: The current query count.
 *   - incrementQueryCount: Function to increment the query count by one.
 *   - isQueryLimitReached: Boolean indicating whether the query limit has been reached.
 */
export const useQueryCount = () => {
  const [queryCount, setQueryCount] = useState<number>(0);
  const [isQueryLimitReached, setIsQueryLimitReached] =
    useState<boolean>(false);
  const isUserSubscribed = useSubscriptionStatus();

  useEffect(() => {
    const storedQueryData = localStorage.getItem(LocalStorageKeys.QUERY_DATA);

    if (storedQueryData) {
      const parsedQueryData: QueryData = JSON.parse(storedQueryData);
      const currentTime = Date.now();

      if (currentTime - parsedQueryData.timestamp <= Millisecond.ONE_HOUR) {
        setQueryCount(parsedQueryData.count);
      } else {
        localStorage.removeItem(LocalStorageKeys.QUERY_DATA);
      }
    }
  }, []);

  useEffect(() => {
    const queryData: QueryData = {
      count: queryCount,
      timestamp: Date.now(),
    };

    localStorage.setItem(
      LocalStorageKeys.QUERY_DATA,
      JSON.stringify(queryData),
    );

    const isQueryReached = queryCount >= Search.MAXIMUM_FREE_QUERIES_PER_HOUR;
    setIsQueryLimitReached(isQueryReached && !isUserSubscribed);
  }, [queryCount, isUserSubscribed]);

  const incrementQueryCount = () => {
    setQueryCount((prevCount) => prevCount + 1);
  };

  return { queryCount, incrementQueryCount, isQueryLimitReached };
};
