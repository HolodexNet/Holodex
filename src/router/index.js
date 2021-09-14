import Vue from "vue";
import VueRouter from "vue-router";
import { loadLanguageAsync } from "@/plugins/vuetify";
import HomeFave from "../views/HomeFave.vue";
import store from "../store";

const Channel = () => import("../views/Channel.vue");
const Channels = () => import("../views/Channels.vue");
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
const Playlists = () => import("../views/Playlists.vue");

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "home",
        component: HomeFave,
        props: { isFavPage: false },
        beforeEnter(to, from, next) {
            // from.name === null when first load, check settings and redirect if necessary
            if (!from.name && store.state.settings.defaultOpen !== "home" && to.fullPath === "/") {
                next(store.state.settings.defaultOpen);
            } else {
                next();
            }
        },
    },
    {
        // Backwards compatibility with old home
        path: "/home",
        redirect(to) {
            const { hash, params, query } = to;
            return {
                name: "home",
                hash,
                params,
                query,
            };
        },
    },
    {
        path: "/favorites/",
        name: "favorites",
        component: HomeFave,
        props: { isFavPage: true },
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
        name: "playlists",
        path: "/playlists",
        component: Playlists,
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
    base: import.meta.env.BASE_URL,
    routes,
    // eslint-disable-next-line no-unused-vars
    scrollBehavior(to, from, savedPosition) {
        // try reload when entering new page, if not on Mobile
        if (!store.state.isMobile && !savedPosition) {
            store.dispatch("reloadCurrentPage", { source: "scrollBehavior", consumed: false });
        }
        if (to.path === from.path) {
            return savedPosition;
        }
        return savedPosition || { x: 0, y: 0 };
    },
});

router.beforeEach((to, from, next) => {
    if (!from.path.match("^/watch")) to.meta.prevPath = from.fullPath;

    const { lang } = store.state.settings;
    if (lang !== "en") {
        Promise.all([loadLanguageAsync(lang)]).then(() => next());
    } else next();
});

export default router;
