import Vue from "vue";
import VueRouter from "vue-router";
// TODO: change to load on request
import Home from "../views/Home.vue";
import Channel from "../views/Channel.vue";
import ChannelList from "../views/ChannelList.vue";
import ChannelVideos from "../views/channel_views/ChannelVideos";
import ChannelAbout from "../views/channel_views/ChannelAbout";
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
        name: "Channel List",
        component: ChannelList,
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
