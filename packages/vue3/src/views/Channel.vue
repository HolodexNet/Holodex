<template>
  <v-container class="channel-container" fluid>
    <v-card>
      <v-img v-if="bannerImage" :src="bannerImage" class="channel-banner" />
      <v-container>
        <v-list>
          <v-list-item>
            <!-- <v-list-item-avatar class="my-0" :size="avatarSize">
              <ChannelImg :size="avatarSize" :channel="channel" />
            </v-list-item-avatar>
            <ChannelInfo :channel="channel" />
            <ChannelSocials :channel="channel" show-delete /> -->
          </v-list-item>
        </v-list>
      </v-container>
      <v-container class="pa-0">
        <v-tabs>
          <v-tab
            v-for="tab in tabs"
            :key="tab.path"
            :to="tab.path"
            :exact="tab.exact"
          >
            {{ tab.name }}
          </v-tab>
        </v-tabs>
      </v-container>
    </v-card>
    <v-container class="channel" style="min-height: 85vh">
      <router-view />
    </v-container>
  </v-container>
  <!-- <LoadingOverlay v-else :is-loading="isLoading" :show-error="hasError" /> -->
</template>

<script lang="ts">
// import api from "@/utils/backend-api";
import { useChannelPreferredName } from "@/hooks/common/useChannelService";
import { getBannerImages, getChannelPhoto } from "@/utils/functions";

export default defineComponent({
  name: "Channel",
  components: {},
  setup() {
    // const channel =
    // const channel = useChannelPreferredName();
    return { channel: undefined };
  },
  computed: {
    bannerImage() {
      if (!this.channel.banner) {
        return "";
      }
      const { mobile, tablet, tv, banner } = getBannerImages(
        this.channel.banner
      );
      const banners = {
        xs: mobile,
        sm: tablet,
        xl: tv,
      };
      return /*banners[this.$vuetify.breakpoint.name] ||*/ banner;
    },
    // avatarSize() {
    //     switch (this.$vuetify.breakpoint.name) {
    //         case "xs":
    //             return 40;
    //         case "sm":
    //             return 40;
    //         default:
    //             return 80;
    //     }
    // },
    tabs(): { path: string; name: string }[] {
      return [
        {
          path: `/channel/${this.id}/`,
          name: `${this.$t("views.channel.video")}`,
        },
        {
          path: `/channel/${this.id}/clips`,
          name: `${this.$t("views.channel.clips")}`,
          hide: this.channel.type === "subber",
        },
        {
          path: `/channel/${this.id}/music`,
          name: `${this.$t("views.channel.music")}`,
          hide: this.channel.type === "subber",
        },
        {
          path: `/channel/${this.id}/collabs`,
          name: `${this.$t("views.channel.collabs")}`,
          hide: this.channel.type === "subber",
        },
        {
          path: `/channel/${this.id}/about`,
          name: `${this.$t("views.channel.about")}`,
        },
        // { path: `/channel/${this.channel_id}/stats`, name: "Stats" },
      ].filter((t) => !t.hide);
    },
    // metaDescription() {
    //   return this.channel?.description?.substr(0, 100);
    // },
    // metaImage() {
    //   return getChannelPhoto(this.channel);
    // },
  },
  methods: {},
});
</script>

<style></style>
