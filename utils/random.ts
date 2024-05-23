import { useCallback, useMemo } from "react";

export const random = useCallback(
  (values: any[]) => values[Math.floor(Math.random() * values.length)],
  [],
);
