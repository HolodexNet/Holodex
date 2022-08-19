<template>
  <!-- <v-container class="channel-container" fluid> -->
  <logo v-if="isLoading" :loading="true" class="max-h-32"></logo>
  <div v-else class="w-full">
    <v-img v-if="bannerImage" :src="bannerImage" class="-mb-12" />
    <div class="mx-full relative bg-bgColor">
      <channel-card
        :channel="channel!"
        class="p-3 rounded-none container mx-auto"
      >
        <template #buttons>
          <div class="grid grid-cols-2 mr-4">
            <a
              class="c-card-icon hover:text-red-500"
              :href="`https://youtube.com/channel/${channel.id}`"
              target="_blank"
              title="Youtube"
            >
              <div class="i-carbon:logo-youtube"></div>
            </a>
            <a
              class="c-card-icon hover:text-cyan-500"
              :class="{
                'btn-disabled bg-inherit opacity-20': !channel.twitter,
              }"
              :href="
                channel.twitter ? `https://twitter.com/${channel.twitter}` : '#'
              "
              target="_blank"
              title="Twitter"
            >
              <div class="i-carbon:logo-twitter"></div>
            </a>
            <button
              class="c-card-icon"
              :title="
                isFav
                  ? $t('component.channelSocials.removeFromFavorites')
                  : $t('component.channelSocials.addToFavorites')
              "
            >
              <div
                :class="
                  isFav ? 'i-mdi:heart text-red-500' : 'i-mdi:heart-outline'
                "
              ></div>
            </button>
          </div>
        </template>
      </channel-card>
      <!-- <v-list-item-avatar class="my-0" :size="avatarSize">
              <ChannelImg :size="avatarSize" :channel="channel" />
            </v-list-item-avatar>
            <ChannelInfo :channel="channel" />
            <ChannelSocials :channel="channel" show-delete /> -->
    </div>
    <v-container class="">
      <div class="tabs">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          class="tab tab-sm sm:tab-md md:tab-lg tab-bordered"
          :to="tab.path"
          >{{ tab.name }}</router-link
        >
      </div>
    </v-container>
  </div>
  <v-container class="" style="min-height: 85vh">
    <router-view />
  </v-container>
  <!-- </v-container> -->
  <!-- <LoadingOverlay v-else :is-loading="isLoading" :show-error="hasError" /> -->
</template>

<script lang="ts">
// import api from "@/utils/backend-api";
import { useChannel } from "@/services/channel";
import { useLangStore } from "@/stores/lang";
import { getBannerImages, getChannelPhoto } from "@/utils/functions";

export default defineComponent({
  name: "Channel",
  components: {},
  setup() {
    const route = useRoute();
    const id = computed(() => route.params.id as string);
    const channel = useChannel(id, true);
    const langPrefs = useLangStore();

    const preferredName = computed(() => {
      return langPrefs.preferredLocaleFn(
        channel.data.value?.english_name || "",
        channel.data.value?.name || ""
      );
    });

    return {
      route,
      channel: channel.data,
      isLoading: channel.isLoading,
      preferredName,
    };
  },
  computed: {
    bannerImage() {
      if (!this.channel?.banner) {
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
          path: `/channel/${this.route.params.id}`,
          name: `${this.$t("views.channel.video")}`,
        },
        {
          path: `/channel/${this.route.params.id}/clips`,
          name: `${this.$t("views.channel.clips")}`,
          hide: this.channel.type === "subber",
        },
        {
          path: `/channel/${this.route.params.id}/music`,
          name: `${this.$t("views.channel.music")}`,
          hide: this.channel.type === "subber",
        },
        {
          path: `/channel/${this.route.params.id}/collabs`,
          name: `${this.$t("views.channel.collabs")}`,
          hide: this.channel.type === "subber",
        },
        {
          path: `/channel/${this.route.params.id}/about`,
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

<style>
.router-link-exact-active {
  @apply tab-active;
}
</style>
