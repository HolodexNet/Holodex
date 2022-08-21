<template>
  <!-- <v-container class="channel-container" fluid> -->
  <logo v-if="isLoading" :loading="true" class="max-h-32"></logo>
  <div v-else class="w-full">
    <scroll-parallax up :speed="0.5"
      ><v-img v-if="bannerImage" :src="bannerImage"></v-img
    ></scroll-parallax>
    <!-- <v-img
      v-if="bannerImage"
      :src="bannerImage"
      class="-mb-0 sm:-mb-6 md:-mb-12"
    /> -->
    <div class="mx-full sticky top-12 bg-bgColor/95 z-10 backdrop-blur">
      <div class="container mx-auto">
        <channel-card
          :channel="channel!"
          class="pb-0 p-2 rounded-none shadow-none"
        >
          <template #buttons>
            <div class="grid grid-cols-2 mr-2 md:mr-4 gap-1 md:gap-2">
              <a
                class="c-social-icon w-8 h-8 md:w-12 md:h-12 hover:text-red-500"
                :href="`https://youtube.com/channel/${channel.id}`"
                target="_blank"
                title="Youtube"
              >
                <div class="i-carbon:logo-youtube"></div>
              </a>
              <a
                class="c-social-icon w-8 h-8 md:w-12 md:h-12 hover:text-cyan-500"
                :class="{
                  'btn-disabled bg-inherit opacity-20': !channel.twitter,
                }"
                :href="
                  channel.twitter
                    ? `https://twitter.com/${channel.twitter}`
                    : '#'
                "
                target="_blank"
                title="Twitter"
              >
                <div class="i-carbon:logo-twitter"></div>
              </a>
              <button
                class="c-social-icon w-8 h-8 md:w-12 md:h-12"
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
              <button
                class="c-social-icon w-8 h-8 md:w-12 md:h-12"
                :title="
                  isFav
                    ? $t('component.channelSocials.block')
                    : $t('component.channelSocials.unblock')
                "
              >
                <div
                  :class="
                    isFav
                      ? 'i-material-symbols:block text-red-500'
                      : 'i-material-symbols:block'
                  "
                ></div>
              </button>
            </div>
          </template>
        </channel-card>
        <div class="tabs">
          <router-link
            v-for="tab in tabs"
            :key="tab.path"
            class="tab tab-md md:tab-lg tab-bordered"
            :to="tab.path"
            >{{ tab.name }}</router-link
          >
        </div>
      </div>

      <!-- <v-list-item-avatar class="my-0" :size="avatarSize">
              <ChannelImg :size="avatarSize" :channel="channel" />
            </v-list-item-avatar>
            <ChannelInfo :channel="channel" />
            <ChannelSocials :channel="channel" show-delete /> -->
    </div>
    <div class="container mx-auto" style="min-height: 85vh">
      <router-view />
    </div>
  </div>
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

.c-social-icon {
  @apply p-2 btn-ghost rounded flex-grow;

  display: inline-flex;
  flex-shrink: 0;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  transition-property: color, background-color, border-color, fill, stroke,
    opacity, box-shadow, transform, filter, -webkit-text-decoration-color,
    -webkit-backdrop-filter;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter, -webkit-text-decoration-color, -webkit-backdrop-filter;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--rounded-btn, 0.5rem);

  min-height: 20px;
  padding: 0;
  line-height: 1.4em;
  font-weight: 600;
  font-size: 1.4rem;
  opacity: 0.5;
  border: 0;
}
.c-social-icon:hover {
  opacity: 1;
}
</style>
