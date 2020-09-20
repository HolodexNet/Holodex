import Vue from "vue";
import VueRouter from "vue-router";
// TODO: change to load on request
import Home from "../views/Home.vue";
const Channel = () => import("../views/Channel.vue");
const Channels = () => import("../views/Channels.vue");
const ChannelVideos = () => import("../views/channel_views/ChannelVideos");
const ChannelAbout = () => import("../views/channel_views/ChannelAbout");
const Watch = () => import("../views/Watch.vue");
const About = () => import("../views/About.vue");

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
        children: [
            {
                path: "clips",
                name: "Channel Clips",
                component: ChannelVideos,
            },
            {
                path: "mentions",
                name: "Channel Mentions",
                component: ChannelVideos,
            },
            {
                path: "about",
                name: "Channel About",
                component: ChannelAbout,
            },
            {
                path: "",
                name: "Channel Videos",
                component: ChannelVideos,
            },
        ],
    },
    {
        path: "/channel/",
        name: "Channels",
        component: Channels,
    },
    {
        name: "Watch",
        path: "/watch/:id",
        component: Watch,
    },
    {
        name: "About",
        path: "/about",
        component: About,
    },
    {
        path: "*",
        component: Home,
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
    // eslint-disable-next-line no-unused-vars
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { x: 0, y: 0 };
        }
    },
});

export default router;
