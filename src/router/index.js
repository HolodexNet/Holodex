import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home";

const Channel = () => import("../views/Channel");
const Channels = () => import("../views/Channels");
const Favorites = () => import("../views/Favorites");
const ChannelVideos = () => import("../views/channel_views/ChannelVideos");
const ChannelAbout = () => import("../views/channel_views/ChannelAbout");
const Watch = () => import("../views/Watch");
const About = () => import("../views/About");
const Search = () => import("../views/Search");
const Library = () => import("../views/Library");
const ChannelStats = () => import("../views/channel_views/ChannelStats");
const Settings = () => import("../views/Settings");
const NotFound = () => import("../views/NotFound");
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
                path: "collabs",
                name: "channel_collabs",
                component: ChannelVideos,
            },
            {
                path: "about",
                name: "channel_about",
                component: ChannelAbout,
            },
            {
                path: "stats",
                name: "channel_stats",
                component: ChannelStats,
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
        path: "/favorites/",
        name: "favorites",
        component: Favorites,
    },
    {
        name: "watch",
        path: "/watch/:id",
        component: Watch,
    },
    {
        name: "library",
        path: "/library",
        component: Library,
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
        path: "/404",
        component: NotFound,
    },
    {
        path: "*",
        component: NotFound,
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
        }
        return { x: 0, y: 0 };
    },
});

export default router;
