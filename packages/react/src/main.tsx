import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import "uno.css";
import { Frame } from "./components/layout/Frame.tsx";
import { useThemeInit } from "./hooks/useTheme.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const GOOGLE_CLIENT_ID =
  "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com";

const queryClient = new QueryClient();

function App() {
  useThemeInit();
  return <Frame />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
