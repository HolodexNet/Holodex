<template>
  <!-- Show channel list as cards -->
  <v-container v-if="cardView" dense>
    <!-- Add headers if it's grouped channels -->
    <v-row v-if="grouped" dense>
      <!-- channelsByGroup has group title and group items, nested loop -->
      <template v-for="(group, index) in channelsByGroup">
        <v-col :key="'title-' + index" cols="12" class="text-h6">
          {{ group.title }}
        </v-col>
        <v-col
          v-for="channel in group.items"
          :key="channel.id"
          cols="12"
          md="4"
          :style="[channel.inactive ? {'opacity' : 0.5} : {'opacity' : 1}]"
        >
          <ChannelCard :channel="channel" />
        </v-col>
      </template>
    </v-row>
    <!-- Or show normally -->
    <v-row v-else dense>
      <v-col
        v-for="channel in channels"
        :key="channel.id"
        cols="12"
        md="4"
        :style="[channel.inactive ? {'opacity' : 0.5} : {'opacity' : 1}]"
      >
        <ChannelCard :channel="channel" />
      </v-col>
    </v-row>
  </v-container>
  <!-- Grouped channel list with headers and a favorite by group button -->
  <v-list v-else-if="grouped" class="pa-0">
    <!-- channelsByGroup has group title and group items, nested loop -->
    <template v-for="(group, index) in channelsByGroup">
      <v-divider :key="'divider-grp' + index" />
      <v-list-group
        :key="`${index}-${group.title}`"
        no-action
        sub-group
        value="0"
      >
        <!-- Header with group name and a favorite all button + tooltip -->
        <template #activator>
          <v-list-item class="d-flex justify-space-between flex-grow-1">
            <v-list-item-title>
              {{ group.title }}
            </v-list-item-title>
            <!-- TODO ADD CONFIRMATION DIALOG -->
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
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
          </v-list-item>
        </template>
        <!-- Channel list -->
        <template v-for="(channel, index2) in group.items">
          <v-divider :key="'divider-' + index2" />
          <v-lazy :key="channel.id" min-height="100" :style="[channel.inactive ? {'opacity' : 0.5} : {'opacity' : 1}]">
            <v-list-item
              v-if="channel"
              :to="`/channel/${channel.id}`"
              style="padding: 0 16px"
              three-line
            >
              <v-list-item-avatar size="55">
                <ChannelImg :channel="channel" size="55" />
              </v-list-item-avatar>
              <ChannelInfo :channel="channel" :include-video-count="includeVideoCount" style="width: 80px">
                <ChannelSocials v-if="isXs" :channel="channel" class="pa-0 justify-start" />
              </ChannelInfo>
              <ChannelSocials v-if="!isXs" :channel="channel" />
            </v-list-item>
          </v-lazy>
        </template>
      </v-list-group>
    </template>
  </v-list>
  <!-- Normal channel list -->
  <v-list v-else class="pa-0">
    <template v-for="(channel, index) in channels">
      <v-divider :key="'divider-' + index" />
      <v-lazy :key="channel.id" min-height="88" :style="[channel.inactive ? {'opacity' : 0.5} : {'opacity' : 1}]">
        <v-list-item
          v-if="channel"
          :to="`/channel/${channel.id}`"
          style="padding: 0 16px"
          three-line
        >
          <v-list-item-avatar size="55">
            <ChannelImg :channel="channel" size="55" />
          </v-list-item-avatar>
          <ChannelInfo :channel="channel" :include-video-count="includeVideoCount">
            <slot v-if="isXs" name="action" :channel="channel">
              <ChannelSocials :channel="channel" class="pa-0 justify-start" :show-delete="showDelete" />
            </slot>
          </ChannelInfo>
          <slot v-if="!isXs" name="action" :channel="channel">
            <ChannelSocials :channel="channel" />
          </slot>
        </v-list-item>
      </v-lazy>
    </template>
  </v-list>
</template>

<script lang="ts">
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
        groupKey: {
            type: String,
            default: "group",
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
                const group = c[this.groupKey] || "Other";
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
            if (Object.keys(this.$store.state.favorites.stagedFavorites).length > 0) {
                this.$store.dispatch("favorites/updateFavorites");
            }
        },
    },
};
</script>

<style>
.v-list-group__header {
    padding-left: 16px !important;
}
</style>
