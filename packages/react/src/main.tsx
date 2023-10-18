import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "react-error-boundary";
import "./index.css";
import "uno.css";
import { useThemeInit } from "./hooks/useTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./lib/i18n";
import { RouterProvider } from "react-router-dom";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import router from "./routes/router";
import { ErrorFallback } from "./components/common/ErrorFallback";

const GOOGLE_CLIENT_ID =
  "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone); // dependent on utc plugin

function App() {
  useThemeInit();
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
          >
            <App />
          </ErrorBoundary>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);