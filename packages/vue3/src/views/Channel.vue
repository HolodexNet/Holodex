<template>
  <!-- <v-container class="channel-container" fluid> -->
  <logo v-if="isLoading" :loading="true" class="max-h-32" />
  <div v-else-if="channel" class="w-full">
    <scroll-parallax up :speed="0.4">
      <img v-if="bannerImage" :src="bannerImage" class="max-h-80" />
    </scroll-parallax>
    <!-- <v-img
      v-if="bannerImage"
      :src="bannerImage"
      class="-mb-0 sm:-mb-6 md:-mb-12"
    /> -->
    <div class="sticky top-12 z-10 max-w-[100vw] bg-bgColor/95 backdrop-blur">
      <div class="container mx-auto">
        <channel-card
          :channel="channel!"
          class="max-w-[100vw] rounded-none p-2 pb-0 shadow-none"
          no-link
          :slim="mobile"
        >
          <template #buttons="{ channelActions }">
            <div
              class="sm:w-30 col-span-2 row-start-2 w-40 grid-flow-row flex-row justify-end gap-1 self-start justify-self-end rounded sm:row-start-auto md:col-span-1 md:w-40 md:gap-2 md:bg-black md:bg-opacity-30"
            >
              <h-btn
                class="h-8 w-8 hover:text-red-500 md:h-12 md:w-12"
                :href="`https://youtube.com/channel/${channel.id}`"
                target="_blank"
                title="Youtube"
                icon="i-carbon:logo-youtube"
                ghost
              />
              <h-btn
                class="h-8 w-8 hover:text-cyan-500 md:h-12 md:w-12"
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
                icon="i-carbon:logo-twitter"
                ghost
              />
              <h-btn
                class="h-8 w-8 hover:text-cyan-500 md:h-12 md:w-12"
                :class="{
                  'btn-disabled bg-inherit opacity-20': !channel.twitch,
                }"
                :href="
                  channel.twitch ? `https://twitch.tv/${channel.twitch}` : '#'
                "
                target="_blank"
                title="Twitter"
                :icon="icons.twitch"
                ghost
              />
              <h-btn
                class="h-8 w-8 md:h-12 md:w-12"
                ghost
                :title="
                  channelActions.isFav.value
                    ? $t('component.channelSocials.removeFromFavorites')
                    : $t('component.channelSocials.addToFavorites')
                "
                :icon="
                  channelActions.isFav.value
                    ? 'i-mdi:heart text-red-500'
                    : 'i-mdi:heart-outline'
                "
                @click="channelActions.toggleFav(channel)"
              />
              <h-btn
                ghost
                class="h-8 w-8 !p-0 md:h-12 md:w-12"
                :title="
                  !isBlocked
                    ? $t('component.channelSocials.block')
                    : $t('component.channelSocials.unblock')
                "
                :icon="
                  isBlocked
                    ? 'i-material-symbols:block text-red-500'
                    : 'i-material-symbols:block'
                "
                @click="blockChannel"
              />
            </div>
          </template>
        </channel-card>

        <h-tabs with-container>
          <h-tab
            v-for="tab in tabs"
            :key="tab.path"
            :active="tab.name === $router.currentRoute.value.name"
            :component="RouterLink"
            :to="tab.path"
            :href="tab.path"
            class="max-h-[4rem] sm:min-h-[2.5rem]"
          >
            <div :class="tab.icon" class="mr-1 md:mr-2" />
            <span>
              {{ tab.name }}
            </span>
          </h-tab>
        </h-tabs>
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
import { useChannelPreferredName } from "@/hooks/common/useChannelService";
import { useDisplay } from "@/hooks/common/useDisplay";
import { useChannel } from "@/services/channel";
import { useLangStore } from "@/stores/lang";
import { useVideoSelection } from "@/stores/selection";
import { useSettingsStore } from "@/stores/settings";
import { useSiteStore } from "@/stores/site";
import { getBannerImages } from "@/utils/functions";
import { RouterLink } from "vue-router";

export default defineComponent({
  name: "Channel",
  components: {},
  setup() {
    const route = useRoute();
    const lastValidID = ref<string>(route.params.id as string);
    const id = computed(() => {
      return route.name?.toString().match(/^Channel(_|$)/)
        ? (route.params.id as string)
        : lastValidID.value;
    });
    // this operates together with lastValidID to prevent unnecessary errors when you navigate away from page.
    watch(id, (newId) => {
      if (newId !== lastValidID.value) {
        lastValidID.value = newId;
      }
    });
    const channel = useChannel(id, true);

    const preferredName = useChannelPreferredName(channel.data);

    // const favList = useFavoritesIDSet();
    // const isFav = computed(() => favList.value?.has(id.value));
    const canFav = computed(() => !!useSiteStore().user);

    const settings = useSettingsStore();
    const isBlocked = computed(() => settings.blockedSet.has(id.value));

    const selection = useVideoSelection();
    selection.context.pageChannel = channel.data.value;
    watch(
      () => channel.data.value,
      () => {
        selection.context.pageChannel = channel.data.value;
      }
    );

    const display = useDisplay();

    return {
      id,
      route,
      channel: channel.data,
      isLoading: channel.isLoading,
      preferredName,
      // favList,
      canFav,
      // isFav,
      isBlocked,
      RouterLink,
      mobile: display.mobile,
    };
  },
  computed: {
    bannerImage() {
      if (!this.channel?.banner) {
        return "";
      }
      const { /*mobile, tablet, tv,*/ banner } = getBannerImages(
        this.channel.banner
      );
      // const banners = {
      //   xs: mobile,
      //   sm: tablet,
      //   xl: tv,
      // };
      return banner;
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
    tabs(): { path: string; name: string; icon?: string }[] {
      return [
        {
          path: `/channel/${this.id}`,
          name: `${this.$t("views.channel.video")}`,
          // icon: this.icons.videos,
        },
        {
          path: `/channel/${this.id}/clips`,
          name: `${this.$t("views.channel.clips")}`,
          hide: this.channel?.type === "subber",
          // icon: this.icons.clips,
        },
        {
          path: `/channel/${this.id}/collabs`,
          name: `${this.$t("views.channel.collabs")}`,
          hide: this.channel?.type === "subber",
          // icon: this.icons.collabs,
        },
        {
          path: `/channel/${this.id}/music`,
          name: `${this.$t("views.channel.music")}`,
          hide: this.channel?.type === "subber",
          // icon: this.icons.music,
        },
        {
          path: `/channel/${this.id}/about`,
          name: `${this.$t("views.channel.about")}`,
          // icon: this.icons.about,
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
  methods: {
    blockChannel() {
      if (!this.channel) return; // typecheck channel not null.
      const settings = useSettingsStore();
      this.isBlocked
        ? (settings.blockedChannels = settings.blockedChannels.filter(
            (x) => x.id !== this.id
          ))
        : useSettingsStore().blockedChannels.push({
            id: this.id,
            name: this.channel.name,
            type: this.channel.type,
            english_name: this.channel.english_name,
            org: this.channel.org,
            lang: this.channel.lang,
            group: this.channel.group,
          });
    },
    // favChannel() {
    //   this.favPatcher.mutateAsync([
    //     {
    //       op: this.isFav ? "remove" : "add",
    //       channel_id: this.id,
    //       channelTemp: this.channel,
    //     },
    //   ]);
    // },
  },
});
</script>

<style lang="css">
.router-link-exact-active {
  @apply tab-active;
}
</style>
