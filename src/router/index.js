import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Channel from "../views/Channel.vue";
import Watch from "../views/Watch.vue";

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
    {
        path: "/watch/:id",
        component: Watch,
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

export default router;
