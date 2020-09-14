import Vue from "vue";
import VueRouter from "vue-router";
// TODO: change to load on request
const Home = () => import("../views/Home.vue");
const Channel = () => import("../views/Channel.vue");
const Channels = () => import("../views/Channels.vue");
const ChannelVideos = () => import("../views/channel_views/ChannelVideos");
const ChannelAbout = () => import("../views/channel_views/ChannelAbout");
const Watch = () => import("../views/Watch.vue");

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
                name: "clips",
                component: ChannelVideos,
            },
            {
                path: "mentions",
                name: "mentions",
                component: ChannelVideos,
            },
            {
                path: "about",
                name: "about",
                component: ChannelAbout,
            },
            {
                path: "",
                name: "videos",
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
        path: "/channel/subbers",
        name: "Subbers",
        component: Channels,
    },
    {
        path: "/watch/:id",
        component: Watch,
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
