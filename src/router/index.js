import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Channel from "../views/Channel.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/channel/:id",
        component: Channel,
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

export default router;
