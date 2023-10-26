import { Navigate, createBrowserRouter } from "react-router-dom";
import { Home } from "@/routes/home";
import { getDefaultStore } from "jotai";
import { orgAtom } from "@/store/org";
import { Frame } from "@/components/layout/Frame";
import { NavigateToMusicdex } from "@/components/channel/NavigateToMusicdex";
import React from "react";

const Login = React.lazy(() => import("./login"));
const Settings = React.lazy(() => import("./settings"));
const SettingsLang = React.lazy(() => import("./settings/lang"));
const SettingsTheme = React.lazy(() => import("./settings/theme"));
const SettingsUser = React.lazy(() => import("./settings/user"));
const SettingsHomepage = React.lazy(() => import("./settings/homepage"));
const SettingsBlocked = React.lazy(() => import("./settings/blocked"));
const About = React.lazy(() => import("./about"));
const AboutGeneral = React.lazy(() => import("./about/general"));
const AboutChangelog = React.lazy(() => import("./about/changelog"));
const AboutFaq = React.lazy(() => import("./about/faq"));
const AboutRequest = React.lazy(() => import("./about/request"));
const AboutPlaceholder = React.lazy(() => import("./about/placeholder"));
const AboutExtensions = React.lazy(() => import("./about/extensions"));
const AboutContact = React.lazy(() => import("./about/contact"));
const AboutPrivacy = React.lazy(() => import("./about/privacy"));
const ChannelsOrg = React.lazy(() => import("./channelsOrg"));
const Channel = React.lazy(() => import("./channel"));
const Kitchensink = React.lazy(() => import("@/Kitchensink"));

const store = getDefaultStore();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Frame />,
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
          {
            path: "lang",
            element: <SettingsLang />,
          },
          {
            path: "themes",
            element: <SettingsTheme />,
          },
          {
            path: "user",
            element: <SettingsUser />,
          },
          {
            path: "homepage",
            element: <SettingsHomepage />,
          },
          {
            path: "blocked",
            element: <SettingsBlocked />,
          },
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
          {
            path: "general",
            element: <AboutGeneral />,
          },
          {
            path: "changelog",
            element: <AboutChangelog />,
          },
          { path: "faq", element: <AboutFaq /> },
          { path: "request", element: <AboutRequest /> },
          {
            path: "placeholder",
            element: <AboutPlaceholder />,
          },
          {
            path: "extensions",
            element: <AboutExtensions />,
          },
          {
            path: "contact",
            element: <AboutContact />,
          },
          {
            path: "privacy",
            element: <AboutPrivacy />,
          },
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
