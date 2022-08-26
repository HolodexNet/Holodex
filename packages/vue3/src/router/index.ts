import { useSiteStore } from "@/stores";
import { musicdexURL } from "@/utils/consts";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// const channelVideos = () => import("@/views/channel/ChannelVideos.vue");
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    redirect: (to) => {
      const orgInParam = to.params.org;
      return {
        name: "Home_Org",
        params: { org: orgInParam || useSiteStore().currentOrg.name },
        replace: true,
      };
    },
  },
  {
    path: "/favorites",
    name: "Favorites",
    props: {
      favorites: true,
    },
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/org/:org",
    name: "Home_Org",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/channels",
    name: "Channels",
    redirect: (to) => {
      const orgInParam = to.params.org;

      return {
        name: "Channels_Org",
        params: { org: orgInParam || useSiteStore().currentOrg.name },
        replace: true,
      };
    },
  },
  {
    path: "/org404",
    name: "OrgNotFound",
    component: () => import("@/views/errors/OrgNotFound.vue"),
  },
  {
    path: "/org/:org/channels",
    name: "Channels_Org",
    component: () => import("@/views/Channels.vue"),
  },
  {
    path: "/channel/:id",
    component: () => import("@/views/Channel.vue"),
    children: [
      {
        name: "channel_about",
        path: "about",
        component: () => import("@/views/channel/ChannelAbout.vue"),
      },
      {
        path: "clips",
        name: "channel_clips",
        component: () => import("@/views/channel/ChannelVideos.vue"),
      },
      {
        path: "collabs",
        name: "channel_collabs",
        component: () => import("@/views/channel/ChannelVideos.vue"),
      },
      {
        path: "music",
        name: "channel_music",
        beforeEnter(to) {
          window.location.replace(`${musicdexURL}/channel/${to.params.id}`);
        },
        redirect(to) {
          window.location.replace(`${musicdexURL}/channel/${to.params.id}`);

          return {
            replace: true,
            path: `${musicdexURL}/channel/${to.params.id}`,
          };
        },
      },
      {
        path: "",
        name: "channel",
        component: () => import("@/views/channel/ChannelVideos.vue"),
      },
    ],
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/Profile.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/Settings.vue"),
    children: [
      {
        name: "Settings_Language",
        path: ":id(lang)?",
        component: () =>
          // structured a bit strangely to avoid chunking the files into tiny pieces.
          import("@/components/settings/index").then((w) => w.langSettings),
      },
      {
        name: "Settings_Themes",
        path: "themes",
        component: () =>
          import("@/components/settings/index").then((w) => w.themeSettings),
      },
      {
        name: "Settings_Homepage",
        path: "homepage",
        component: () =>
          import("@/components/settings/index").then((w) => w.homeSettings),
      },
      {
        name: "Settings_Blocked",
        path: "blocked",
        component: () =>
          import("@/components/settings/index").then((w) => w.blockedSettings),
      },
      {
        name: "Settings_Advanced",
        path: "advanced",
        component: () =>
          import("@/components/settings/index").then((w) => w.langSettings),
      },
    ],
  },
  {
    path: "/playlists",
    name: "Playlists",
    component: () => import("@/views/Playlist.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/About.vue"),
  },
  {
    path: "/kitchensink",
    name: "Kitchen Sink",
    component: () => import("@/views/KitchenSink.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/tlclient",
    name: "Translation Client",
    component: () => import("@/views/TranslationClient.vue"),
  },
  {
    path: "/tlscripter",
    name: "Translation Scripter",
    component: () => import("@/views/TranslationScripter.vue"),
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
