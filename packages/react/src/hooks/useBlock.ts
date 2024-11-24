import { History } from "history";
import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

interface NavBlockerControl {
  confirm: () => void;
  cancel: () => void;
}

interface NavBlocker {
  onBlock: (control: NavBlockerControl) => void;
  enabled?: boolean;
}

/**
 * Hook to block navigation based on a condition.
 *
 * @param {Object} params - Parameters for the hook.
 * @param {function} params.onBlock - Function to be called when navigation is blocked.
 * @param {boolean} [params.enabled] - Flag to enable or disable the navigation blocker.
 *
 * This hook uses the `UNSAFE_NavigationContext` from `react-router-dom` to block navigation.
 */
export const useNavBlocker = ({ onBlock, enabled }: NavBlocker) => {
  const { block } = useContext(UNSAFE_NavigationContext).navigator as History;

  // Latest ref pattern
  // Latest version of the function stored to the onBlockRef
  const onBlockRef = useRef(onBlock);
  useLayoutEffect(() => {
    onBlockRef.current = onBlock;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = false;

    const unblock = block(({ retry }) => {
      if (isActive) {
        unblock();
        // Retry method handles navigation for us 🎉
        // Allows to simplify code even more.
        return retry();
      }

      // This doesn't need to be included in dependencies
      // and won't trigger useEffect
      onBlockRef.current({
        confirm: retry,
        cancel: () => {
          isActive = false;
        },
      });

      isActive = true;
    });

    return unblock;
  }, [block, enabled]);
};
