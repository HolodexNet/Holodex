import { BrowserRouter, Routes } from "react-router-dom";
import { useThemeInit } from "./hooks/useTheme";
import { useSyncTFunction } from "./store/i18n";
import { Suspense, useEffect } from "react";
import { routes } from "./routes/router";

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

  return (
    <BrowserRouter>
      <Suspense>
        <Routes>{routes}</Routes>
      </Suspense>
    </BrowserRouter>
  );
}
