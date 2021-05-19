<template>
    <div>
        <v-menu
            bottom
            nudge-top="20px"
            :position-x="videoCardMenu && videoCardMenu.x"
            :position-y="videoCardMenu && videoCardMenu.y"
            v-model="showVideoCardMenu"
            absolute
        >
            <v-list dense v-if="video">
                <v-list-item @click.stop="copyLink"
                    ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                    {{ $t("component.videoCard.copyLink") }}
                </v-list-item>
                <v-list-item @click.stop target="_blank" :href="`https://youtu.be/${video.id}`"
                    ><v-icon left>{{ icons.mdiYoutube }}</v-icon>
                    {{ $t("views.settings.redirectModeLabel") }}
                </v-list-item>

                <v-list-item
                    :disabled="video.type === 'clip'"
                    :to="`/multiview/AAUY${video.id}${getChannelShortname(video.channel)}%2CUAEYchat`"
                    ><v-icon left :color="video.type === 'clip' ? 'grey' : ''">{{ icons.mdiViewDashboard }}</v-icon>
                    {{ $t("component.mainNav.multiview") }}
                </v-list-item>
                <v-list-item :disabled="video.type === 'clip'" :to="`/edit/video/${video.id}`"
                    ><v-icon left :color="video.type === 'clip' ? 'grey' : ''">{{ icons.mdiPencil }}</v-icon>
                    {{ $t("component.videoCard.edit") }}
                </v-list-item>
                <v-list-item @click="$store.commit('setReportVideo', video)">
                    <v-icon left :color="video.type === 'clip' ? 'grey' : ''">{{ icons.mdiFlag }} </v-icon>
                    {{ $t("component.reportDialog.title") }}
                </v-list-item>
            </v-list>
        </v-menu>
        <v-snackbar app v-model="doneCopy" :timeout="3000" color="success">
            {{ $t("component.videoCard.copiedToClipboard") }}
            <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" @click="doneCopy = false">
                    {{ $t("views.app.close_btn") }}
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script>
import copyToClipboard from "@/mixins/copyToClipboard";

export default {
    mixins: [copyToClipboard],
    data() {
        return {
            doneCopy: false,
            lastVideoId: null,
            changed: false,
        };
    },
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
        copyLink() {
            const link = `${window.origin}/watch/${this.video.id}`;
            this.copyToClipboard(link);
            this.showVideoCardMenu = false;
        },
    },
};
</script>

<style></style>
