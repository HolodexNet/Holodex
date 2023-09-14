import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { Frame } from "./components/layout/Frame.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme accentColor="amber" appearance="dark">
      <Frame>
      </Frame>
    </Theme>
  </React.StrictMode>,
);
