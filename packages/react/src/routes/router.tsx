import { Navigate, createBrowserRouter } from "react-router-dom";
import { getDefaultStore } from "jotai";
import { orgAtom } from "@/store/org";
import { Frame } from "@/components/layout/Frame";
import { NavigateToMusicdex } from "@/components/channel/NavigateToMusicdex";
import React from "react";

// const Login = React.lazy(() => import("./login"));
// const Settings = React.lazy(() => import("./settings"));
// const SettingsLang = React.lazy(() => import("./settings/lang"));
// const SettingsTheme = React.lazy(() => import("./settings/theme"));
// const SettingsUser = React.lazy(() => import("./settings/user"));
// const SettingsHomepage = React.lazy(() => import("./settings/homepage"));
// const SettingsBlocked = React.lazy(() => import("./settings/blocked"));
// const About = React.lazy(() => import("./about"));
// const AboutGeneral = React.lazy(() => import("./about/general"));
// const AboutChangelog = React.lazy(() => import("./about/changelog"));
// const AboutFaq = React.lazy(() => import("./about/faq"));
// const AboutRequest = React.lazy(() => import("./about/request"));
// const AboutPlaceholder = React.lazy(() => import("./about/placeholder"));
// const AboutExtensions = React.lazy(() => import("./about/extensions"));
// const AboutContact = React.lazy(() => import("./about/contact"));
// const AboutPrivacy = React.lazy(() => import("./about/privacy"));
// const Watch = React.lazy(() => import("./watch"));
// const ChannelsOrg = React.lazy(() => import("./channelsOrg"));
// const Channel = React.lazy(() => import("./channel"));
const ChannelVideos = React.lazy(() => import("./channel/ChannelVideos"));
const ChannelAbout = React.lazy(() => import("./channel/ChannelAbout"));
// const EditVideo = React.lazy(() => import("./editVideo"));
// const Kitchensink = React.lazy(() => import("@/Kitchensink"));
// const Playlists = React.lazy(() => import("./playlists"));
// const Playlist = React.lazy(() => import("./playlist"));
// const Favourites = React.lazy(() => import("./favourites"));

const store = getDefaultStore();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Frame />,
    children: [
      {
        path: "favorites",
        async lazy() {
          const Favourites = (await import("./favourites")).default;
          return { Component: Favourites };
        },
      },
      {
        path: "search",
        element: <div>Search</div>,
      },
      {
        path: "org/:org",
        async lazy() {
          const Home = (await import("./home")).Home;
          return { Component: Home };
        },
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
        path: "add_placeholder",
        element: <Navigate to="/about/placeholder" />,
      },
      {
        path: "add_placeholders",
        element: <Navigate to="/about/placeholder" />,
      },
      {
        path: "org/:org/channels",
        async lazy() {
          const OrgChannels = (await import("./orgChannels")).default;
          return { Component: OrgChannels };
        },
      },
      {
        path: "channel/:id",
        async lazy() {
          const Channel = (await import("./channel")).default;
          return { Component: Channel };
        },
        children: [
          {
            index: true,
            element: <ChannelVideos type="videos" />,
          },
          {
            path: "about",
            element: <ChannelAbout />,
          },
          {
            path: "clips",
            element: <ChannelVideos type="clips" />,
          },
          {
            path: "collabs",
            element: <ChannelVideos type="collabs" />,
          },
          {
            path: "music",
            element: <NavigateToMusicdex />,
          },
        ],
      },
      {
        path: "edit/video/:id",
        async lazy() {
          const EditVideo = (await import("./editVideo")).default;
          return { Component: EditVideo };
        },
      },
      {
        path: "profile",
        element: <div>Profile</div>,
      },
      {
        path: "settings",
        // element: <Settings />,
        async lazy() {
          const { Settings } = await import("./settings");
          return { Component: Settings };
        },
        children: [
          {
            path: "",
            async lazy() {
              const { SettingsLang } = await import("./settings");
              return { Component: SettingsLang };
            },
          },
          {
            path: "lang",
            async lazy() {
              const { SettingsLang } = await import("./settings");
              return { Component: SettingsLang };
            },
          },
          {
            path: "themes",
            async lazy() {
              const { SettingsTheme } = await import("./settings");
              return { Component: SettingsTheme };
            },
          },
          {
            path: "user",
            async lazy() {
              const { SettingsUser } = await import("./settings");
              return { Component: SettingsUser };
            },
          },
          {
            path: "homepage",
            async lazy() {
              const { SettingsHomepage } = await import("./settings");
              return { Component: SettingsHomepage };
            },
          },
          {
            path: "blocked",
            async lazy() {
              const { SettingsBlocked } = await import("./settings");
              return { Component: SettingsBlocked };
            },
          },
          // Add children routes similar to above pattern
        ],
      },
      {
        path: "playlists",
        async lazy() {
          const Playlists = (await import("./playlists")).default;
          return { Component: Playlists };
        },
      },
      {
        path: "playlist/:id",
        async lazy() {
          const Playlist = (await import("./playlist")).default;
          return { Component: Playlist };
        },
      },
      {
        path: "about",
        async lazy() {
          const { About } = await import("./about");
          return { Component: About };
        },
        children: [
          {
            path: "",
            async lazy() {
              const { AboutGeneral } = await import("./about");
              return { Component: AboutGeneral };
            },
          },
          {
            path: "general",
            async lazy() {
              const { AboutGeneral } = await import("./about");
              return { Component: AboutGeneral };
            },
          },
          {
            path: "changelog",
            async lazy() {
              const { AboutChangelog } = await import("./about");
              return { Component: AboutChangelog };
            },
          },
          {
            path: "faq",
            async lazy() {
              const { AboutFaq } = await import("./about");
              return { Component: AboutFaq };
            },
          },
          {
            path: "request",
            async lazy() {
              const AboutRequest = (await import("./about/request")).default;
              return { Component: AboutRequest };
            },
          },
          {
            path: "placeholder",
            async lazy() {
              const AboutPlaceholder = (await import("./about/placeholder"))
                .default;
              return { Component: AboutPlaceholder };
            },
          },
          {
            path: "extensions",
            async lazy() {
              const { AboutExtensions } = await import("./about");
              return { Component: AboutExtensions };
            },
          },
          {
            path: "contact",
            async lazy() {
              const { AboutContact } = await import("./about");
              return { Component: AboutContact };
            },
          },
          {
            path: "privacy",
            async lazy() {
              const { AboutPrivacy } = await import("./about");
              return { Component: AboutPrivacy };
            },
          },
        ],
      },
      {
        path: "kitchensink",
        async lazy() {
          const Kitchensink = (await import("@/Kitchensink")).default;
          return { Component: Kitchensink };
        },
      },
      {
        path: "login",
        async lazy() {
          const Login = (await import("./login")).default;
          return { Component: Login };
        },
      },
      {
        path: "tlclient",
        element: <div>Translation Client</div>,
      },
      {
        path: "scripteditor",
        async lazy() {
          const TLEditorFrame = (await import("./tleditor")).default;
          return { Component: TLEditorFrame };
        },
      },
      {
        path: "watch/:id",
        async lazy() {
          const Watch = (await import("./watch")).default;
          return { Component: Watch };
        },
      },
      {
        path: "debug",
        async lazy() {
          const Debug = (await import("./debug")).default;
          return { Component: Debug };
        },
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
