<template>
    <div v-if="showVideoCardMenu">
        <v-menu
            bottom
            nudge-top="20px"
            :position-x="videoCardMenu && videoCardMenu.x"
            :position-y="videoCardMenu && videoCardMenu.y"
            v-model="showVideoCardMenu"
            absolute
            :close-on-click="false"
            v-click-outside="onClickOutside"
        >
            <v-list dense v-if="video">
                <!-- <v-list-item @click.stop="copyLink"
                    ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                    {{ $t("component.videoCard.copyLink") }}
                </v-list-item> -->
                <v-list-item @click.stop target="_blank" :href="`https://youtu.be/${video.id}`"
                    ><v-icon left>{{ icons.mdiYoutube }}</v-icon>
                    {{ $t("views.settings.redirectModeLabel") }}
                </v-list-item>

                <v-list-item v-if="video.status === 'upcoming'" @click.prevent.stop="openGoogleCalendar">
                    <v-icon left>
                        {{ icons.mdiCalendar }}
                    </v-icon>
                    {{ $t("component.videoCard.googleCalendar") }}
                </v-list-item>
                <template v-if="video.type !== 'clip'">
                    <v-list-item :to="`/multiview/AAUY${video.id}${getChannelShortname(video.channel)}%2CUAEYchat`">
                        <v-icon left>{{ icons.mdiViewDashboard }}</v-icon>
                        {{ $t("component.mainNav.multiview") }}
                    </v-list-item>
                    <v-list-item :to="`/edit/video/${video.id}`">
                        <v-icon left>{{ icons.mdiPencil }}</v-icon>
                        {{ $t("component.videoCard.edit") }}
                    </v-list-item>
                </template>
                <v-list-item @click="$store.commit('setReportVideo', video)">
                    <v-icon left>{{ icons.mdiFlag }} </v-icon>
                    {{ $t("component.reportDialog.title") }}
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import { dayjs } from "@/utils/time";

export default {
    watch: {
        video() {
            this.$store.commit("setShowVideoCardMenu", true);
        },
    },
    computed: {
        video() {
            return this.$store.state.videoCardMenu && this.$store.state.videoCardMenu.video;
        },
        videoCardMenu() {
            return this.$store.state.videoCardMenu;
        },
        showVideoCardMenu: {
            get() {
                return this.$store.state.showVideoCardMenu;
            },
            set(val) {
                this.$store.commit("setShowVideoCardMenu", val);
            },
        },
    },
    methods: {
        getChannelShortname(ch) {
            return (
                (ch.english_name && ch.english_name.split(/[/\s]/g).join("_")) ||
                ch.name.split(/[/\s]/)[0].replace(",", "")
            );
        },
        // Override Vuetify's v-menu click outside with our own
        onClickOutside(e) {
            // Fixes bug where clicking on another video card's menu would cause it to close
            // Check if the target is another video-card-menu or it's desecendant
            if (e.target.matches(".video-card-menu, .video-card-menu *")) return;
            this.showVideoCardMenu = false;
        },
        // Open google calendar to add the time specified in the element
        openGoogleCalendar() {
            const startdate = this.video.start_scheduled;
            const url1 = "https://www.google.com/calendar/render?action=TEMPLATE&text=";
            const videoTitle = encodeURIComponent(this.video.title);
            const url2 = "&dates=";
            const googleCalendarFormat = "YYYYMMDD[T]HHmmss";
            const eventStart = dayjs(startdate).format(googleCalendarFormat);
            const eventEnd = dayjs(startdate).add(1, "hour").format(googleCalendarFormat);
            window.open(url1.concat(videoTitle, url2, eventStart, "/", eventEnd), "_blank");
        },
    },
};
</script>

<style></style>
