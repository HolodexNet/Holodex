import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import "uno.css";
import { QueryClientProvider } from "@tanstack/react-query";
import "./lib/i18n";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { App } from "./App";
import { TooltipProvider } from "./shadcn/ui/tooltip";
import { globalQueryClient } from "./lib/query";

const GOOGLE_CLIENT_ID =
  "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com";

const JotaiDevtools =
  process.env.NODE_ENV === "development"
    ? React.lazy(async () => {
        const [moduleExports, _] = await Promise.all([
          import("jotai-devtools"),
          import("jotai-devtools/styles.css"),
        ]);
        return { default: moduleExports.DevTools };
      })
    : () => null;

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? React.lazy(async () => {
        return {
          default: (await import("@tanstack/react-query-devtools"))
            .ReactQueryDevtools,
        };
      })
    : () => null;

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone); // dependent on utc plugin
dayjs.extend(localizedFormat);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={globalQueryClient}>
        {process.env.NODE_ENV === "development" && (
          <Suspense>
            <ReactQueryDevtools position={"right"} buttonPosition="top-right" />
            <JotaiDevtools position="top-right" />
          </Suspense>
        )}
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {/* <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
          > */}
          <TooltipProvider>
            <App />
          </TooltipProvider>
          {/* </ErrorBoundary> */}
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
