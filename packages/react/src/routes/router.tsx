import { Outlet, createBrowserRouter, redirect } from "react-router-dom";

const settings = {}; // TODO: replace with your actual settings store
const site = {}; // TODO: replace with your actual site store

const router = createBrowserRouter([
  {
    path: "/",
    element: <div />,
    loader: async ({ params }) => {
      // Replace with your logic
      const orgInParam = params.org; // TODO: Get the parameter from the current location

      if (orgInParam || settings.defaultOpen === "Home" || !site.jwtToken) {
        // Do the necessary redirect logic here
        return redirect('/org/' + params.org)
      } else {
        // Do the necessary redirect logic here
        return redirect('/favorites/')
        // return <div>Redirecting to Favorites...</div>;
      }
    }
  },
  {
    path: "/favorites",
    element: <div>Favorites</div>,
  },
  {
    path: "/search",
    element: <div>Search</div>,
  },
  {
    path: "/org/:org",
    element: <div>Home_Org</div>,
  },
  {
    path: "/channels",
    element: <RedirectToChannelsOrg />,
  },
  {
    path: "/org404",
    element: <div>OrgNotFound</div>,
  },
  {
    path: "/org/:org/channels",
    element: <div>Channels_Org</div>,
  },
  {
    path: "/channel/:id",
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
        element: <RedirectToMusicdex />,
      },
      {
        path: "",
        element: <div>Channel</div>,
      },
    ],
  },
  {
    path: "/profile",
    element: <div>Profile</div>,
  },
  {
    path: "/settings",
    element: <Settings />,
    children: [
      // Add children routes similar to above pattern
    ],
  },
  {
    path: "/playlists",
    element: <div>Playlists</div>,
  },
  {
    path: "/about",
    element: <About />,
    children: [
      // Add children routes similar to above pattern
    ],
  },
  {
    path: "/kitchensink",
    element: <div>Kitchen Sink</div>,
  },
  {
    path: "/login",
    element: <div>Login</div>,
  },
  {
    path: "/tlclient",
    element: <div>Translation Client</div>,
  },
  {
    path: "/scripteditor",
    element: <div>Translation Scripter</div>,
  },
  {
    path: "/watch/:id",
    element: <div>Watch</div>,
  },
  {
    path: "/debug",
    element: <div>Debug</div>,
  },
  {
    path: "/debug/run",
    element: <div>Debug Run</div>,
  },
]);

export default router;

function RedirectToChannelsOrg() {
  // Replace with your logic
  return <div>Redirecting to Channels_Org...</div>;
}

function Channel() {
  // Add logic if needed
  return <div>Channel main page<Outlet /></div>;
}

function RedirectToMusicdex() {
  // Add logic for redirection
  return <div>Redirecting to Musicdex...</div>;
}

function Settings() {
  // Add logic if needed
  return <div>Settings main page<Outlet /></div>;
}

function About() {
  // Add logic if needed
  return <div>About main page<Outlet /></div>;
}
