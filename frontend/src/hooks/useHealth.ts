// Lightweight connection monitor: polls /health so the UI always knows,
// within one interval, whether the backend is reachable. When the connection
// comes back after an outage, every cached query is refetched so the user
// never has to know what a cache is.

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../lib/api";

const POLL_MS = 10_000;

export function useHealth() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["health"],
    queryFn: () => api.health(),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const wasDown = useRef(false);
  useEffect(() => {
    if (query.isError) {
      wasDown.current = true;
    } else if (query.isSuccess && wasDown.current) {
      wasDown.current = false;
      qc.invalidateQueries();
    }
  }, [query.isError, query.isSuccess, qc]);

  return { isDown: query.isError, checkNow: query.refetch };
}
