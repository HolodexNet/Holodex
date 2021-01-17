import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home";

import Channel from "../views/Channel";
import Channels from "../views/Channels";
import Favorites from "../views/Favorites";
import ChannelVideos from "../views/channel_views/ChannelVideos";
import ChannelAbout from "../views/channel_views/ChannelAbout";
import Watch from "../views/Watch";
import About from "../views/About";
import Search from "../views/Search";
import Library from "../views/Library";
import Settings from "../views/Settings";
import NotFound from "../views/NotFound";
import Login from "../views/Login";
// const ChannelStats = () => import("../views/channel_views/ChannelStats");

// const MugenClips = () => import("../views/MugenClips");
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
            // {
            //     path: "stats",
            //     name: "channel_stats",
            //     component: ChannelStats,
            // },
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
        name: "watch_id",
        path: "/watch/:id",
        component: Watch,
    },
    {
        name: "watch",
        path: "/watch",
        component: Watch,
    },
    {
        name: "mugen-clips",
        path: "/infinite",
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
        name: "login",
        path: "/login",
        component: Login,
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
        const fromHistory = Boolean(savedPosition);

        if (fromHistory && this.app.$store.state.routerHistory.length > 0) {
            this.app.$store.dispatch("navigate", {});
        } else {
            this.app.$store.dispatch("navigate", { from: from.fullPath });
        }
        // console.log(from);
        return savedPosition || { x: 0, y: 0 };
    },
});

export default router;
