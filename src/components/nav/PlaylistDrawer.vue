<template>
    <v-navigation-drawer
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        app
        width="240"
        clipped
        right
        class="nav-scroll thin-scroll-bar"
        :temporary="temporary"
        style="padding-top: env(safe-area-inset-top); padding-right: calc(env(safe-area-inset-right) / 1.3)"
    >
        <slot />
        <v-list dense class="pb-0"> </v-list>
    </v-navigation-drawer>
</template>

<script lang="ts">
import { langs } from "@/plugins/vuetify";
import { dayjs } from "@/utils/time";
import { mdiTuneVariant } from "@mdi/js";

export default {
    name: "NavDrawer",
    components: {},
    props: {
        pages: {
            required: true,
            type: Array,
        },
        value: {
            type: Boolean,
            default: false,
        },
        temporary: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            favoritesExpanded: false,
            tick: Date.now(),
            ticker: null,

            mdiTuneVariant,
        };
    },
    mounted() {
        this.ticker = setInterval(() => {
            this.tick = Date.now();
        }, 60000);
    },
    beforeDestroy() {
        if (this.ticker) clearInterval(this.ticker);
    },
    computed: {
        // ...mapState("favorites", ["favorites", "live"]),
        language() {
            return langs.find((x) => x.val === this.$store.state.settings.lang).display;
        },
        favorites() {
            const fav = this.$store.state.favorites.favorites;
            // const nameProp = this.$store.state.settings.nameProperty;
            const lives: Array<any> = this.$store.state.favorites.live;
            const updateNotice = this.$store.state.favorites.lastLiveUpdate;
            console.debug(`Updating favs: ${updateNotice}`);

            // const videos: Array<any> = [...lives];
            // const favWithVideos = videos.sort(
            //     (a, b) =>
            //         dayjs(a.start_actual || a.start_scheduled).valueOf() -
            //             dayjs(b.start_actual || a.start_scheduled).valueOf(),
            // );

            const existingChs = new Set(lives.map((x) => x.channel.id));

            // remainder:
            const extras = fav
                .filter((x) => !existingChs.has(x.id))
                .map((ch) => ({
                    channel: ch,
                }));

            return [...lives, ...extras];
        },
        collapsedFavorites() {
            return !this.favoritesExpanded && this.favorites.length > 8 ? this.favorites.slice(0, 8) : this.favorites;
        },
    },
    methods: {
        handlePageClick(page) {
            // reload the page if user clicks on the same tab
            page.path === this.$route.path && !this.$route.query.page
                ? this.$router.go(0)
                : this.$router.push({ path: page.path });
        },
        formatDurationUpcoming(ts) {
            const secs = dayjs(ts).diff(dayjs()) / 1000;
            if (secs > 0) {
                const h = Math.floor(secs / (60 * 60));
                const m = Math.floor((secs % (60 * 60)) / 60);
                return h ? `${h}h` : `${m}m`;
            }
            return "●";
        },
        isLive(video) {
            return video.status === "live";
        },
        // getChannelLiveAtTime,
    },
};
</script>

<style>
.nav-scroll > .v-navigation-drawer__content {
    scrollbar-width: thin; /* firefox fall back */
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
}

.nav-scroll > .v-navigation-drawer__content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.5);
}

.nav-scroll > .v-navigation-drawer__content:hover {
    overflow-y: auto !important; /* firefox fallback */
    overflow-y: overlay !important;
}

/* overflow-y: overlay does not work on temporary drawer */
.nav-scroll.v-navigation-drawer--temporary > .v-navigation-drawer__content {
    overflow-y: auto !important;
}

.nav-scroll > .v-navigation-drawer__content {
    overflow-y: hidden !important;
}
</style>
