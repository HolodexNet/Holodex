import { HtmlPortalNode, createHtmlPortalNode } from "react-reverse-portal";
import { createContext } from "react";

export const VideoPortalContext = createContext<HtmlPortalNode>(
  createHtmlPortalNode(),
);
