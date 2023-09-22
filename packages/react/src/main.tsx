import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "uno.css";
import { Frame } from "./components/layout/Frame.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <Theme accentColor="amber" appearance="dark"> */}
    <Frame />
    {/* </Theme> */}
  </React.StrictMode>,
);
