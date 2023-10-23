import React from "react";
import { useThemeInit } from "./hooks/useTheme";
import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { useSyncTFunction } from "./store/i18n";

export function App() {
  useThemeInit();
  useSyncTFunction();
  return <RouterProvider router={router} />;
}
