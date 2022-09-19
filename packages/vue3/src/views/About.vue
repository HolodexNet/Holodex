<template>
  <v-container key="aboutpg" class="flex flex-col pt-3 align-middle">
    <v-col cols="12">
      <div class="text-3xl">{{ $t("component.mainNav.about") }} Holodex</div>
    </v-col>
    <!-- STATS -->
    <holodex-stats />
    <v-row>
      <v-col cols="12" md="4" lg="4" xl="3">
        <!-- CREDITS -->
        <v-card>
          <v-card-title>
            <div class="text-h6">
              {{ $t("about.credits.title") }}
            </div>
          </v-card-title>
          <v-card-text>
            <p class="text-body-2">
              {{ $t("about.credits.contents[0]") }}
              <a href="https://hololive.jetri.co/">HoloTools</a>
              {{ $t("about.credits.contents[1]") }}
              <a href="https://github.com/holofans/holoapi">holoapi</a>.
              <br />
              {{ $t("about.credits.contents[2]") }}
            </p>
            <br />
            <p class="text-body-2">
              {{ $t("about.credits.contents[3]") }}
              <a href="https://en.hololive.tv/terms">
                {{ $t("about.credits.contents[4]") }}
              </a>
            </p>
          </v-card-text>
        </v-card>
        <!-- LINKS -->
        <v-card class="mt-4">
          <v-card-title>
            <div class="text-h6">
              {{ $t("about.quicklinks") }}
            </div>
          </v-card-title>
          <v-card-text>
            <v-btn color="info" block class="mb-4 text-left" to="/addChannel">
              <div class="i-ic:baseline-add-circle"></div>
              {{ $t("views.about.add_my_channel") }}
            </v-btn>
            <v-btn
              block
              class="my-4 text-left bg-indigo-500"
              target="_blank"
              href="https://discord.gg/jctkgHBt4b"
            >
              <div :class="icons.discord"></div>
              {{ $t("about.discordBtn") }}
            </v-btn>
            <v-btn
              class="my-4 text-left deep-purple"
              block
              target="_blank"
              href="https://github.com/RiceCakess/Holodex"
            >
              <div class="i-fe:github"></div>
              GitHub
            </v-btn>
            <v-btn
              class="mt-4 text-left orange"
              block
              href="https://holodex.stoplight.io/"
              target="_blank"
            >
              <div class="i-ant-design:api-outlined"></div>
              API documentation
            </v-btn>
            <v-btn class="mt-4 text-left green accent-4" block to="/extension">
              <div class="i-ion:extension-puzzle-outline"></div>
              {{ $t("views.extension.title") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- TWITTER TIMELINE -->
      <v-col cols="12" md="4" lg="4" xl="4">
        <v-card
          class="border-solid border-bgColor pa-0 bg-bgColor-600 inset-1"
          style="
            height: 650px;
            border-radius: 13px;
            border-width: 2px;
            border-style: inset;
          "
        >
          <twitter-feed :key="'twtrTimeline' + timelinekey" />
        </v-card>
      </v-col>
      <!-- CHANGELOG -->
      <v-col cols="12" md="4" lg="4" xl="5">
        <v-card>
          <v-card-title>
            <a
              class="text-h6"
              href="https://github.com/RiceCakess/Holodex/blob/dev/docs/CHANGELOG.md"
            >
              {{ $t("about.changelog.title") }}
            </a>
          </v-card-title>
          <iframe
            width="100%"
            seamless
            src="https://holodexnet.github.io/Holodex/CHANGELOG.html"
            style="height: 606px; border: none; background: #eee"
          />
        </v-card>
      </v-col>
    </v-row>
    <v-row class="flex-row" style="margin-top: 1.5rem">
      <!-- FAQ -->
      <v-col cols="12" md="6" lg="6" xl="6">
        <v-card>
          <v-card-title>
            <div class="text-h6">
              {{ $t("about.faq.title") }}
            </div>
          </v-card-title>
          <about-faq></about-faq>
        </v-card>
      </v-col>
      <!-- BOOKMARKLETS -->
      <v-col cols="12" md="4" lg="4" xl="4">
        <v-card>
          <v-card-title>
            <div class="text-h6">
              {{ $t("about.bookmarklet.title") }}
            </div>
          </v-card-title>
          <v-card-text>
            <p>{{ $t("about.bookmarklet.description") }}</p>
            <div class="flex flex-col" style="margin-left: 0px">
              <v-btn
                class="mt-4 text-left grey"
                href="javascript:(function(){var v=new%20URLSearchParams(window.location.search).get('v');v&&(window.location.href='https://holodex.net/watch/'+v)})()"
              >
                Open in Holodex
              </v-btn>
              <v-btn
                class="mt-4 text-left grey"
                href="javascript:(function(){var v=new%20URLSearchParams(window.location.search).get('v');v&&(window.location.href='https://staging.holodex.net/watch/'+v)})()"
              >
                Open in Holodex Beta
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default defineComponent({
  name: "About",
  components: {},
  data() {
    return {
      timelinekey: 12,
    };
  },
  activated() {
    this.timelinekey += 1;
  },
});
</script>

<style>
.v-expansion-panel-text__wrap {
  padding-top: 12px;
}
</style>
