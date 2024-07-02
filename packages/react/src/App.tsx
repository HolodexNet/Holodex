import { useThemeInit } from "./hooks/useTheme";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { useSyncTFunction } from "./store/i18n";
import { useEffect } from "react";

export function App() {
  useThemeInit();
  useSyncTFunction();
  useEffect(() => {
    // Set up listener for cross-window communication
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel("app_data_reset");
      channel.onmessage = (event) => {
        if (event.data === "RESET_AND_RELOAD") {
          window.location.reload();
        }
      };

      return () => channel.close();
    }
  }, []);

  return <RouterProvider router={router} />;
}
