import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * A hook that returns true if rendering on the client side (after hydration),
 * and false if rendering on the server side. Uses useSyncExternalStore to avoid
 * any useEffect state update warnings or cascading renders.
 */
export function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
