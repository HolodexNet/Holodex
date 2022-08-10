import { useSiteStore } from "@/stores";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    redirect: (to) => {
      const site = useSiteStore();
      return {
        name: "Home_Org",
        params: { org: site.currentOrg.name },
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
      const site = useSiteStore();

      return {
        name: "Channels_Org",
        params: { org: site.currentOrg.name },
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
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/Profile.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/Settings.vue"),
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
