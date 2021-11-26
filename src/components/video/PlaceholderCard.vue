<template>
  <v-dialog
    :value="value"
    :width="isTooSmall?'96%':'80%'"
    max-width="980"
    @input="$listeners.input"
  >
    <v-sheet style="position:relative;">
      <v-img v-if="video.thumbnail" :src="'/statics/thumbnail/maxres/'+enc(video.thumbnail)+'.jpg'" style="" />
      <v-img v-else max-height="130px" :src="`https://www.banner.yt/${video.channel_id || video.channel.id}/mobile`" />
      <v-sheet style="height:12px;" />
      <watch-info :video="videoWithMentions" no-sub-count>
        <template slot="rightTitleAction">
          <v-btn
            v-if="video.placeholderType === 'scheduled-yt-stream'"
            large
            color="primary"
            class="float-right placeholder-punchout"
            :href="video.link"
            target="_blank"
          >
            <v-icon left>
              {{ icons.mdiYoutube }}
            </v-icon>
            {{ $t('component.placeholderVideo.scheduledEvent') }}
          </v-btn>
          <v-btn
            v-else
            large
            color="primary"
            class="float-right placeholder-punchout"
            target="_blank"
            :href="video.link"
          >
            <v-icon left>
              {{ icons.mdiOpenInNew }}
            </v-icon>
            {{ video.placeholderType === 'external-stream' ? $t('component.placeholderVideo.streamPageBtn') : $t('component.placeholderVideo.eventPageBtn') }}
          </v-btn>
        </template>
        <v-list-item two-line class="text-body-2 pl-7 mt-n4" style="text-align: left;">
          <v-list-item-content>
            <span>{{ $t('component.placeholderVideo.creditTitleText') }}</span>
            <span v-if="video.credits.discord && discordCredits && discordCredits.data">
              <i18n path="component.placeholderVideo.discordCredit" :tag="false">
                <template #0>
                  {{ video.credits.discord.user }}
                </template>
                <template #1>
                  <strong><a :href="`https://discord.gg/${video.credits.discord.link}`" style="display:inline-block;">
                    <v-icon small color=""> {{ icons.mdiDiscord }}</v-icon>{{ discordCredits.data.guild.name }}</a>
                  </strong>
                </template>
              </i18n>
            </span>
            <span v-if="video.credits.datasource">
              {{ $t('component.placeholderVideo.datasourceCredit', [video.credits.datasource.name]) }}
              <strong><a :href="video.credits.datasource.link">
                <v-icon small>{{ icons.mdiOpenInNew }}</v-icon>{{ video.credits.datasource.link }}</a>
              </strong>
            </span>
            <span v-if="video.credits.bot">
              {{ $t('component.placeholderVideo.botCredit', [video.credits.bot.name, video.credits.bot.user]) }}
              <strong><a :href="video.credits.bot.link">
                <v-icon small>{{ icons.mdiOpenInNew }}</v-icon>{{ video.credits.bot.link }}</a>
              </strong>
            </span>
            <span v-if="video.credits.editor">
              {{ $t('component.placeholderVideo.editorCredit', [video.credits.editor.name]) }}
            </span>
          </v-list-item-content>
        </v-list-item>
      </watch-info>
    </v-sheet>
  </v-dialog>
</template>

<script>
import WatchInfo from "@/components/watch/WatchInfo.vue";
import backendApi from "@/utils/backend-api";

export default {
    components: {
        WatchInfo,
    },
    props: {
        value: {
            type: Boolean,
            required: true,
        },
        video: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            discordCredits: {},
            mentions: [],
        };
    },
    computed: {
        isTooSmall() {
            return this.$vuetify.breakpoint.width < 700;
        },
        videoWithMentions() {
            return { ...this.video, mentions: this.mentions };
        },
    },
    async mounted() {
        if (this.video?.credits?.discord) { this.discordCredits = await backendApi.discordServerInfo(this.video.credits.discord.link); }
        this.updateMentions();
    },
    methods: {
        enc(url) {
            const enc = btoa(url);
            const n = enc.replace("+", "-").replace("/", "_").replace(/=+$/, "");
            // console.log(`https://staging.holodex.net/thumbnail/maxres/${n}.jpg`);
            return n;
        },
        updateMentions() {
            backendApi
                .getMentions(this.video.id)
                .then(({ data }) => {
                    // this.isLoading = false;
                    this.mentions = data;
                });
        },
    },

};
</script>

<style>
.placeholder-punchout {
    position: absolute;
    right: 20px;
    margin-top: 15px;
    z-index: 30;
}
</style>
