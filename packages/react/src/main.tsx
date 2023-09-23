import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "uno.css";
import { Frame } from "./components/layout/Frame.tsx";
import { useThemeInit } from "./hooks/useTheme.ts";

function App() {
  useThemeInit();

  return <Frame />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
