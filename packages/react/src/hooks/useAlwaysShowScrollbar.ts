import { useEffect } from "react";

const useAlwaysShowScrollbar = () => {
  useEffect(() => {
    const originalOverflow = document.documentElement.style.overflowY;
    // const originalPaddingRight = document.documentElement.style.paddingRight;

    // Calculate the width of the scrollbar
    // const scrollbarWidth =
    //   window.innerWidth - document.documentElement.clientWidth;

    // Always show scrollbar
    document.documentElement.style.overflowY = "scroll";
    // document.documentElement.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      // Reset to original styles on cleanup
      document.documentElement.style.overflowY = originalOverflow;
      // document.documentElement.style.paddingRight = originalPaddingRight;
    };
  }, []);
};

export default useAlwaysShowScrollbar;
