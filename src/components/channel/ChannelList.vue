<template>
    <!-- Show channel list as cards -->
    <v-container v-if="cardView" dense>
        <!-- Add headers if it's grouped channels -->
        <v-row v-if="grouped" dense>
            <!-- channelsByGroup has group title and group items, nested loop -->
            <template v-for="(group, index) in channelsByGroup">
                <v-col cols="12" class="text-h6" :key="'title-' + index">
                    {{ group.title }}
                </v-col>
                <v-col cols="12" md="4" :key="channel.id" v-for="channel in group.items">
                    <ChannelCard :channel="channel" />
                </v-col>
            </template>
        </v-row>
        <!-- Or show normally -->
        <v-row v-else dense>
            <v-col cols="12" md="4" :key="channel.id" v-for="channel in channels">
                <ChannelCard :channel="channel" />
            </v-col>
        </v-row>
    </v-container>
    <!-- Grouped channel list with headers and a favorite by group button -->
    <v-list class="pa-0" v-else-if="grouped">
        <!-- channelsByGroup has group title and group items, nested loop -->
        <v-list-group
            v-for="(group, index) in channelsByGroup"
            :key="`${index}-${group.title}`"
            no-action
            sub-group
            value="0"
        >
            <!-- Header with group name and a favorite all button + tooltip -->
            <template v-slot:activator>
                <div class="d-flex justify-space-between flex-grow-1">
                    <v-list-item-title>
                        {{ group.title }}
                    </v-list-item-title>
                    <!-- TODO ADD CONFIRMATION DIALOG -->
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn sm outlined @click.stop="toggleFavoriteAll(index)">
                                <v-icon
                                    :color="group.allFavorited && isLoggedIn ? 'red' : 'grey'"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    {{ icons.mdiHeart }}
                                </v-icon>
                                {{ $t("views.search.type.all") }}
                            </v-btn>
                        </template>
                        <span>
                            {{
                                !isLoggedIn
                                    ? $t("component.channelList.signInToFavorite")
                                    : group.allFavorited
                                    ? $t("component.channelList.unfavoriteAllInGroup")
                                    : $t("component.channelList.favoriteAllInGroup")
                            }}
                        </span>
                    </v-tooltip>
                </div>
            </template>
            <!-- Channel list -->
            <template v-for="(channel, index) in group.items">
                <v-divider :key="'divider-' + index"></v-divider>
                <v-list-item
                    v-if="channel"
                    :key="channel.id"
                    :to="`/channel/${channel.id}`"
                    style="padding: 0 16px"
                    three-line
                >
                    <v-list-item-avatar size="55">
                        <ChannelImg :channel="channel" size="55" />
                    </v-list-item-avatar>
                    <ChannelInfo :channel="channel" :includeVideoCount="includeVideoCount" style="width: 80px">
                        <ChannelSocials :channel="channel" class="pa-0 justify-start" v-if="isXs" />
                    </ChannelInfo>
                    <ChannelSocials :channel="channel" v-if="!isXs" />
                </v-list-item>
            </template>
        </v-list-group>
    </v-list>
    <!-- Normal channel list -->
    <v-list class="pa-0" v-else>
        <template v-for="(channel, index) in channels">
            <v-divider :key="'divider-' + index"></v-divider>
            <v-list-item
                v-if="channel"
                :key="channel.id"
                :to="`/channel/${channel.id}`"
                style="padding: 0 16px"
                three-line
            >
                <v-list-item-avatar size="55">
                    <ChannelImg :channel="channel" size="55" />
                </v-list-item-avatar>
                <ChannelInfo :channel="channel" :includeVideoCount="includeVideoCount">
                    <ChannelSocials
                        :channel="channel"
                        class="pa-0 justify-start"
                        v-if="isXs"
                        :showDelete="showDelete"
                    />
                </ChannelInfo>
                <ChannelSocials :channel="channel" v-if="!isXs" :showDelete="showDelete" />
            </v-list-item>
        </template>
    </v-list>
</template>

<script lang="ts">
import * as icons from "@/utils/icons";
import ChannelImg from "./ChannelImg.vue";
import ChannelInfo from "./ChannelInfo.vue";
import ChannelSocials from "./ChannelSocials.vue";

export default {
    name: "ChannelList",
    components: {
        ChannelImg,
        ChannelInfo,
        ChannelSocials,
        ChannelCard: () => import("./ChannelCard.vue"),
    },
    data() {
        return {
            icons,
        };
    },
    props: {
        channels: {
            type: Array,
            required: true,
        },
        cardView: {
            type: Boolean,
            default: false,
        },
        includeVideoCount: {
            type: Boolean,
            default: false,
        },
        grouped: {
            type: Boolean,
            default: false,
        },
        showDelete: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isXs() {
            return this.$vuetify.breakpoint.width <= 420;
        },
        channelsByGroup() {
            const groupedChannels = [];
            let lastGroup = "";
            this.channels.forEach((c) => {
                const group = c.group || "Other";
                if (group !== lastGroup) {
                    groupedChannels.push({
                        title: group,
                        items: [],
                        allFavorited: true,
                    });
                    lastGroup = group;
                }
                groupedChannels[groupedChannels.length - 1].items.push(c);
                if (!this.isFavorited(c.id)) {
                    groupedChannels[groupedChannels.length - 1].allFavorited = false;
                }
            });
            return groupedChannels;
        },
        isLoggedIn() {
            return this.$store.getters.isLoggedIn;
        },
    },
    methods: {
        isFavorited(id) {
            return this.$store.getters["favorites/isFavorited"](id);
        },
        toggleFavoriteAll(index) {
            if (!this.isLoggedIn) return;
            const allFav = this.channelsByGroup[index].allFavorited;
            this.channelsByGroup[index].items.forEach((c) => {
                // favorite anything that is not favorited already
                // unfavorite all, if all is favorited
                if ((!this.isFavorited(c.id) && !allFav) || (this.isFavorited(c.id) && allFav)) {
                    this.$store.commit("favorites/toggleFavorite", c.id);
                }
            });
            if (Object.keys(this.$store.state.favorites.stagedFavorites).length > 0)
                this.$store.dispatch("favorites/updateFavorites");
        },
    },
};
</script>

<style>
.v-list-group__header {
    padding-left: 16px !important;
}
</style>
