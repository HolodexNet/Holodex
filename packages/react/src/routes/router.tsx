import { Navigate, createBrowserRouter } from "react-router-dom";
import { Home } from "@/routes/home";
import { ChannelsOrg } from "./channelsOrg";
import { getDefaultStore } from "jotai";
import { orgAtom } from "@/store/org";
import { Frame } from "@/components/layout/Frame";
// import { Login } from "./login";
// import { Settings } from "./settings";
// import { About } from "./about";
// import { Channel } from "./channel";
import { NavigateToMusicdex } from "@/components/channel/NavigateToMusicdex";
import React from "react";
import { ErrorFallback } from "@/components/common/ErrorFallback";

const Login = React.lazy(() => import("./login"));
const Settings = React.lazy(() => import("./settings"));
const About = React.lazy(() => import("./about"));
const Channel = React.lazy(() => import("./channel"));
const Kitchensink = React.lazy(() => import("@/Kitchensink"));

const store = getDefaultStore();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Frame />,
    ErrorBoundary: ErrorFallback,
    children: [
      {
        path: "favorites",
        element: <div>Favorites</div>,
      },
      {
        path: "search",
        element: <div>Search</div>,
      },
      {
        path: "org/:org",
        element: <Home />,
      },
      {
        path: "channels",
        element: <Navigate to={`/org/${store.get(orgAtom)}/channels`} />,
      },
      {
        path: "org404",
        element: <div>OrgNotFound</div>,
      },
      {
        path: "org/:org/channels",
        element: <ChannelsOrg />,
      },
      {
        path: "channel/:id",
        element: <Channel />,
        children: [
          {
            path: "about",
            element: <div>Channel_About</div>,
          },
          {
            path: "clips",
            element: <div>Channel_Clips</div>,
          },
          {
            path: "collabs",
            element: <div>Channel_Collabs</div>,
          },
          {
            path: "music",
            element: <NavigateToMusicdex />,
          },
        ],
      },
      {
        path: "profile",
        element: <div>Profile</div>,
      },
      {
        path: "settings",
        element: <Settings />,
        children: [
          // Add children routes similar to above pattern
        ],
      },
      {
        path: "playlists",
        element: <div>Playlists</div>,
      },
      {
        path: "about",
        element: <About />,
        children: [
          // Add children routes similar to above pattern
        ],
      },
      {
        path: "kitchensink",
        element: <Kitchensink />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "tlclient",
        element: <div>Translation Client</div>,
      },
      {
        path: "scripteditor",
        element: <div>Translation Scripter</div>,
      },
      {
        path: "watch/:id",
        element: <div>Watch</div>,
      },
      {
        path: "debug",
        element: <div>Debug</div>,
      },
      {
        path: "debug/run",
        element: <div>Debug Run</div>,
      },
      {
        path: "*",
        element: <div>Not found</div>,
      },
    ],
  },
]);

export default router;
