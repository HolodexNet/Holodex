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
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
