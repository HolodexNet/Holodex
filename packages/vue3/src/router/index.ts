import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
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
    name: "Home - Org",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/views/Profile.vue"),
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
