import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

import store from "../store";

const Channel = () => import("../views/Channel.vue");
const Channels = () => import("../views/Channels.vue");
const Favorites = () => import("../views/Favorites.vue");
const ChannelVideos = () => import("../views/channel_views/ChannelVideos.vue");
const ChannelAbout = () => import("../views/channel_views/ChannelAbout.vue");
const ChannelMusic = () => import("../views/channel_views/ChannelMusic.vue");
const Watch = () => import("../views/Watch.vue");
const About = () => import("../views/About.vue");
const Search = () => import("../views/Search.vue");
const Library = () => import("../views/Library.vue");
// const ChannelStats = () => import("../views/channel_views/ChannelStats.vue");
const Settings = () => import("../views/Settings.vue");
const NotFound = () => import("../views/NotFound.vue");
const Login = () => import("../views/Login.vue");
const EditVideo = () => import("../views/EditVideo.vue");
const OrgMusic = () => import("../views/OrgMusic.vue");
// const MugenClips = () => import("../views/MugenClips.vue");
const MultiView = () => import("../views/MultiView.vue");

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        redirect(to) {
            const { hash, params, query } = to;
            if (store.state.settings.defaultOpenFavorites) return { name: "favorites", hash, params, query };
            return { name: "home", hash, params, query };
        },
    },
    {
        path: "/home",
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
                path: "music",
                name: "channel_music",
                component: ChannelMusic,
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
        path: "/music/",
        name: "music",
        component: OrgMusic,
    },
    {
        path: "/favorites/",
        name: "favorites",
        component: Favorites,
    },
    {
        name: "watch",
        path: "/watch/:id?",
        component: Watch,
    },
    {
        name: "edit_video",
        path: "/edit/video/:id/:tab?",
        component: EditVideo,
    },
    {
        name: "mugen-clips",
        path: "/infinite",
        component: Watch,
    },
    {
        name: "multiview",
        path: "/multiview/:layout?",
        component: MultiView,
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
        // try reload when entering new page, if not on Mobile
        if (!store.state.isMobile && !savedPosition) {
            store.dispatch("reloadCurrentPage", { source: "scrollBehavior", consumed: false });
        }
        return savedPosition;
    },
});

export default router;
