<template>
  <v-dialog
    :value="value"
    :width="isTooSmall?'96%':'80%'"
    max-width="980"
    @input="$listeners.input"
  >
    <v-sheet style="position:relative;">
      <!-- <v-card> -->
      <!-- https://imgproxy.evilmartians.com/Aci-sOo-F7BXOZNypMu2xFE5UpFTArNR4rciK8U-mbo/rs:fit:289:173/dpr:2/wm:0.5:soea:0:0:0.2/wmu:aHR0cHM6Ly9pbWdwcm94eS5uZXQvd2F0ZXJtYXJrLnN2Zw/plain/https:%2F%2Fwww.nasa.gov%2Fsites%2Fdefault%2Ffiles%2Fthumbnails%2Fimage%2Fpia22228.jpg -->
      <v-img v-if="video.thumbnail" :src="'/statics/thumbnail/maxres/'+enc(video.thumbnail)+'.jpg'" style="" />
      <v-img v-else max-height="130px" :src="`https://www.banner.yt/${video.channel_id || video.channel.id}/mobile`" />
      <v-sheet style="height:12px;" />
      <watch-info :video="video" no-sub-count>
        <template slot="rightTitleAction">
          <v-btn
            v-if="video.ghostType === 'scheduled-yt-stream'"
            large
            color="primary"
            class="float-right ghost-punchout"
            :href="video.link"
            target="_blank"
          >
            <v-icon left>
              {{ icons.mdiYoutube }}
            </v-icon>
            {{ $t('component.ghostVideo.scheduledEvent') }}
          </v-btn>
          <v-btn
            v-else
            large
            color="primary"
            class="float-right ghost-punchout"
            target="_blank"
            :href="video.link"
          >
            <v-icon left>
              {{ icons.mdiOpenInNew }}
            </v-icon>
            {{ video.ghostType === 'external-stream' ? $t('component.ghostVideo.streamPageBtn') : $t('component.ghostVideo.eventPageBtn') }}
          </v-btn>
        </template>
        <v-list-item two-line class="text-body-2 pl-7 mt-n4" style="text-align: left;">
          <v-list-item-content>
            <span>Credits:</span>
            <span v-if="video.credits.discord && discordCredits && discordCredits.data">
              {{ $t('component.ghostVideo.discordCredit', [video.credits.discord.user]) }}
              <strong><a :href="`https://discord.gg/${video.credits.discord.link}`" style="display:inline-block;">
                <v-icon small color=""> {{ icons.mdiDiscord }}</v-icon>{{ discordCredits.data.guild.name }}</a>
              </strong>
            </span>
            <span v-if="video.credits.datasource">
              {{ $t('component.ghostVideo.datasourceCredit', [video.credits.datasource.name]) }}
              <strong><a :href="video.credits.datasource.link">
                <v-icon small>{{ icons.mdiOpenInNew }}</v-icon>{{ video.credits.datasource.link }}</a>
              </strong>
            </span>
            <span v-if="video.credits.bot">
              {{ $t('component.ghostVideo.botCredit', [video.credits.bot.name, video.credits.bot.user]) }}
              <strong><a :href="video.credits.bot.link">
                <v-icon small>{{ icons.mdiOpenInNew }}</v-icon>{{ video.credits.bot.link }}</a>
              </strong>
            </span>
          </v-list-item-content>
        </v-list-item>
        <!-- Empty div used to erase description -->
      </watch-info>

      <!-- </v-card> -->
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
        };
    },
    computed: {
        isTooSmall() {
            return this.$vuetify.breakpoint.width < 700;
        },
    },
    async mounted() {
        this.discordCredits = await backendApi.discordServerInfo(this.video.credits.discord.link);
    },
    methods: {
        enc(url) {
            const enc = btoa(url);
            const n = enc.replace("+", "-").replace("/", "_").replace(/=+$/, "");
            // console.log(`https://staging.holodex.net/thumbnail/maxres/${n}.jpg`);
            return n;
        },
    },

};
</script>

<style>
.ghost-punchout {
    position: absolute;
    right: 20px;
    margin-top: 15px;
    z-index: 30;
}
</style>
