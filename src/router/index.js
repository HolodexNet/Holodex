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
const Search = () => import("../views/Search.vue");
const Settings = () => import("../views/Settings.vue");
Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "home",
        component: Home,
    },
    {
        path: "/channel/:id",
        component: Channel,
        children: [
            {
                path: "clips",
                name: "channel_clips",
                component: ChannelVideos,
            },
            {
                path: "mentions",
                name: "channel_mentions",
                component: ChannelVideos,
            },
            {
                path: "about",
                name: "channel_about",
                component: ChannelAbout,
            },
            {
                path: "",
                name: "channel",
                component: ChannelVideos,
            },
        ],
    },
    {
        path: "/channel/",
        name: "channels",
        component: Channels,
    },
    {
        name: "watch",
        path: "/watch/:id",
        component: Watch,
    },
    {
        name: "about",
        path: "/about",
        component: About,
    },
    {
        name: "search",
        path: "/search",
        component: Search,
    },
    {
        name: "settings",
        path: "/settings",
        component: Settings,
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
