import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/profiles",
    name: "Profiles",
    component: () => import("@/views/Profile.vue"),
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
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
