import Vue from "vue";
import VueRouter from "vue-router";
import { loadLanguageAsync } from "@/plugins/vuetify";
import { musicdexURL } from "@/utils/consts";
import HomeFave from "../views/HomeFave.vue";
import store from "../store";

const Channel = () => import("../views/Channel.vue");
const Channels = () => import("../views/Channels.vue");
const ChannelVideos = () => import("../views/channel_views/ChannelVideos.vue");
const ChannelAbout = () => import("../views/channel_views/ChannelAbout.vue");
const Watch = () => import("../views/Watch.vue");
const About = () => import("../views/About.vue");
const Search = () => import("../views/Search.vue");
const Library = () => import("../views/Library.vue");
// const ChannelStats = () => import("../views/channel_views/ChannelStats.vue");
const Settings = () => import("../views/Settings.vue");
const NotFound = () => import("../views/NotFound.vue");
const Login = () => import("../views/Login.vue");
const EditVideo = () => import("../views/EditVideo.vue");
const MultiView = () => import("../views/MultiView.vue");
const Playlists = () => import("../views/Playlists.vue");
const AddPlaceholderStream = () => import("../views/AddPlaceholderStream.vue");
const AddChannelRequest = () => import("../views/AddChannelRequest.vue");

const Extension = () => import("../views/Extension.vue");

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
                beforeEnter(to) {
                    window.location.replace(`${musicdexURL}/channel/${to.params.id}`);
                },
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
        path: "/watch/:id?",
        component: Watch,
    },
    {
        name: "edit_video",
        path: "/edit/video/:id/:tab?",
        component: EditVideo,
    },
    {
        name: "add_placeholder",
        path: "/add_placeholder",
        component: AddPlaceholderStream,
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
        name: "extension",
        path: "/extension",
        component: Extension,
    },
    {
        path: "/404",
        component: NotFound,
    },
    {
        path: "/addChannel",
        component: AddChannelRequest,
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

    if (from.query.lang) {
        to.query.lang = from.query.lang;
    }
    const queryLang = to.query.lang;
    const { lang } = store.state.settings;
    const actualLang = queryLang || lang;
    const queryOrg = to.query.org;

    if (queryOrg && store.state.currentOrg.name !== queryOrg) {
        store.dispatch("orgs/fetchOrgs").then(() => {
            const overrideOrg = store.state.orgs.orgs.find((o) => o.name === queryOrg);
            store.commit("setCurrentOrg", overrideOrg);
        });
    }

    if (actualLang !== "en") {
        loadLanguageAsync(actualLang).then(() => next());
    } else { next(); }
});

export default router;
