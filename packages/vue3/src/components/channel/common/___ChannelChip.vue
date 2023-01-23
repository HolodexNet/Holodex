<template>
  <!-- struggling a little bit with mobile/desktop compatibility -->
  <v-menu
    v-model="isHover"
    open-on-click
    open-on-focus
    :open-on-hover="!display.mobile"
    class=""
    top
    :nudge-top="size + 5"
    content-class="elevation-0"
    :close-delay="closeDelay"
  >
    <template #activator="{ props }">
      <v-avatar left :size="size" class="mr-1" v-bind="props">
        <v-img
          :src="photo"
          crossorigin="anonymous"
          :alt="`${channel.name}'s profile picture`"
          :width="size"
          :height="size"
        />
        <!-- <span class="channel-name-overlay">{{ channelName }}</span> -->
        <slot :is-hover="isHover">
          <v-fade-transition>
            <v-overlay v-show="isHover" absolute class="chip-overlay">
              <v-btn icon :to="`/channel/${channel.id}`">
                <v-icon>{{ icons.mdiLoginVariant }}</v-icon>
              </v-btn>
            </v-overlay>
          </v-fade-transition>
        </slot>
      </v-avatar>
    </template>
    <div class="channel-hover-tooltip">
      <!-- <ChannelSocials :channel="channel" vertical hide-yt hide-twitter /> -->
      <span class="grey--text text--lighten-1 ml-2">{{ channelName }}</span>
    </div>
  </v-menu>
</template>

<script lang="ts">
import { getChannelPhoto } from "@/utils/functions";
// import ChannelSocials from "@/components/channel/ChannelSocials.vue";
import { useSettingsStore } from "@/stores/settings";
import { useLangStore } from "@/stores/lang";
import { useDisplay } from "vuetify";

export default defineComponent({
  name: "ChannelChip",
  // components: {
  //   ChannelSocials,
  // },
  props: {
    channel: {
      type: Object,
      required: true,
    },
    size: {
      type: Number,
      required: false,
      default: 60,
    },
    closeDelay: {
      type: Number,
      required: false,
      default: 250,
    },
    // close: {
    //     type: Boolean,
    //     required: false,
    // },
  },
  setup() {
    const display = useDisplay();
    const lang = useLangStore();
    const settings = useSettingsStore();
    return { display, settings, lang };
  },
  data() {
    return { isHover: false };
  },
  computed: {
    channelName() {
      return this.lang.preferredLocaleFn(
        this.channel.english_name,
        this.channel.name
      );
    },
    photo() {
      return getChannelPhoto(this.channel.id, this.size);
    },
  },
});
</script>

<style>
.channel-hover-tooltip {
  background-color: rgba(58, 58, 58, 0.7);
  display: flex;
  flex-direction: row;
  align-items: baseline;
  padding: 0 8px 0 0;
  margin-top: -3px;
  max-height: 32px;
  overflow: hidden;
}
</style>
