<template>
  <!-- <v-container class="channel-container" fluid> -->
  <div class="w-full">
    <scroll-parallax up :speed="0.4"
      ><img
        src="https://holodex.net/img/intro-promo.jpg"
        class="object-cover object-top w-full max-h-60"
        style="object-position: 0px 10%"
    /></scroll-parallax>
    <!-- <v-img
        v-if="bannerImage"
        :src="bannerImage"
        class="-mb-0 sm:-mb-6 md:-mb-12"
      /> -->
    <div class="sticky z-10 mx-full top-12 bg-bgColor/95 backdrop-blur">
      <div class="container mx-auto">
        <div
          class="flex flex-row items-center p-4 pb-1 overflow-hidden rounded-none rounded-md shadow-none channel-card justify-self-auto"
        >
          <div class="flex-shrink-0 indicator">
            <!--v-if--><!-- Render with opaque response for cache if size is lte 40 -->
            <logo class="w-16 mr-4" />
          </div>
          <div class="flex-grow">
            <span class="text-xs text-neutral opacity-60"><b>About</b> </span>
            <span class="-mt-1 text-lg line-clamp-1">Holodex</span>
          </div>
          <div class="grid grid-cols-2 gap-1 mr-2 md:mr-4 md:gap-2">
            <a
              class="w-8 h-8 c-social-icon md:w-12 md:h-12 hover:text-red-500"
              :href="`https://youtube.com/channel/${channel.id}`"
              target="_blank"
              title="Youtube"
            >
              <div class="i-carbon:logo-youtube"></div>
            </a>
            <a
              class="w-8 h-8 c-social-icon md:w-12 md:h-12 hover:text-cyan-500"
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
          </div>
        </div>
        <h-tabs with-container class="pt-1">
          <h-tab
            v-for="tab in tabs"
            :key="tab.path"
            :active="tab.name === $router.currentRoute.value.name"
            :component="RouterLink"
            :to="tab.path"
            class="line-clamp-1 whitespace-nowrap shrink-0"
            style="line-height: 110%"
          >
            <div :class="tab.class" class="inline-block mr-1 md:mr-2"></div>
            {{ tab.name }}
          </h-tab>
        </h-tabs>
      </div>
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
import {
  useFavoritesListByID,
  useFavoritesPatcher,
} from "@/services/favorites";
import { useLangStore } from "@/stores/lang";
import { useSettingsStore } from "@/stores/settings";
import { useSiteStore } from "@/stores/site";
import { getBannerImages } from "@/utils/functions";
import { RouterLink } from "vue-router";
import { useDisplay } from "vuetify";

export default defineComponent({
  name: "Channel",
  components: {},
  setup() {
    const route = useRoute();
    const id = computed(() => {
      return route.name?.toString().match(/^Channel(_|$)/)
        ? (route.params.id as string)
        : "";
    });
    const channel = {
      isLoading: false,
      data: {
        id: "holodex",
        name: "Holodex",
        english_name: "Holodex",
        org: "About:",
        group: "",
        photo: "https://holodex.net/img/icons/uetchy_logo_morespace.png",
        twitter: "holodex",
      } as FullChannel,
    };
    const langPrefs = useLangStore();

    const preferredName = computed(() => {
      return langPrefs.preferredLocaleFn(
        channel.data.english_name || "",
        channel.data.name || ""
      );
    });

    const favList = useFavoritesListByID();
    const isFav = computed(() => favList.value?.has(id.value));
    const canFav = computed(() => !!useSiteStore().user);

    const settings = useSettingsStore();
    const isBlocked = computed(() => settings.blockedSet.has(id.value));
    const favPatcher = useFavoritesPatcher();

    return {
      id,
      route,
      channel: channel.data,
      isLoading: channel.isLoading,
      preferredName,
      favList,
      canFav,
      isFav,
      isBlocked,
      favPatcher,
      RouterLink,
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
    tabs(): { path: string; name: string; class: string }[] {
      return [
        {
          path: `/about`,
          name: "Information",
          class: this.icons.about,
        },
        {
          path: `/about/faq`,
          name: "Frequently Asked Questions",
          class: this.icons.about,
        },
        {
          path: `/about/contact`,
          name: "Contact",
          class: this.icons.collabs,
        },
        {
          path: `/about/privacy`,
          name: "Privacy Policy",
          class: "i-material-symbols:privacy-tip",
        },
      ];
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
    favChannel() {
      this.favPatcher.mutateAsync([
        {
          op: this.isFav ? "remove" : "add",
          channel_id: this.id,
          channelTemp: this.channel,
        },
      ]);
    },
  },
});
</script>

<style lang="css">
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
