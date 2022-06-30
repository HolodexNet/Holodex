<template>
  <v-container key="aboutpg" class="flex flex-col align-middle pt-3">
    <v-col cols="12">
      <div class="text-3xl">
        {{ $t("component.mainNav.about") }}
      </div>
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
            <v-btn
              color="info white--text"
              block
              class="text-left mb-4"
              to="/addChannel"
            >
              <v-icon left>
                {{ mdiAccountPlus }}
              </v-icon>
              {{ $t("views.about.add_my_channel") }}
            </v-btn>
            <v-btn
              color="indigo white--text"
              block
              class="text-left my-4"
              target="_blank"
              href="https://discord.gg/jctkgHBt4b"
            >
              <v-icon left>
                {{ icons.mdiDiscord }}
              </v-icon>
              {{ $t("about.discordBtn") }}
            </v-btn>
            <v-btn
              class="text-left my-4 white--text deep-purple"
              block
              target="_blank"
              href="https://github.com/RiceCakess/Holodex"
            >
              <v-icon left>
                {{ mdiGithub }}
              </v-icon>
              GitHub
            </v-btn>
            <v-btn
              class="text-left mt-4 white--text orange"
              block
              href="https://holodex.stoplight.io/"
              target="_blank"
            >
              <v-icon left>
                {{ mdiConsole }}
              </v-icon>
              API documentation
            </v-btn>
            <v-btn
              class="text-left mt-4 white--text green accent-4"
              block
              to="/extension"
            >
              <v-icon left>
                {{ mdiPuzzleOutline }}
              </v-icon>
              {{ $t("views.extension.title") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- TWITTER TIMELINE -->
      <v-col cols="12" md="4" lg="4" xl="4">
        <v-card class="pa-0" style="height: 100%">
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
          <v-expansion-panels accordion focusable>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.ytchatHeader") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.ytchatContent") }}
                <br />
                <a
                  href="https://support.mozilla.org/en-US/kb/third-party-cookies-firefox-tracking-protection?redirectslug=disable-third-party-cookies"
                >
                  {{ $t("about.faq.ytchatFirefox") }}
                </a>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.autoplayHeader") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.autoplayContent") }}
                <br />
                <br />Safari: <br />
                <img
                  width="80%"
                  src="https://www.imore.com/sites/imore.com/files/styles/large/public/field/image/2017/07/safari-custom-settings-websites-mac-screenshot-06.jpg?itok=ONVYTcno"
                />
                <br />Firefox: <br />
                <img
                  width="80%"
                  src="https://ffp4g1ylyit3jdyti1hqcvtb-wpengine.netdna-ssl.com/firefox/files/2019/04/Screen-Shot-2019-04-01-at-11.21.21-AM.png"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.mobile.title") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.mobile.content.summary") }}
                <ul>
                  <li>
                    {{ $t("about.faq.mobile.content.android.0") }}
                    <v-icon color="primary">
                      {{ icons.mdiDotsVertical }}
                    </v-icon>
                    {{ $t("about.faq.mobile.content.android.1") }}
                  </li>
                  <li>
                    {{ $t("about.faq.mobile.content.ios.0") }}
                    <v-icon color="primary">
                      {{ mdiExportVariant }}
                    </v-icon>
                    {{ $t("about.faq.mobile.content.ios[1]") }}
                  </li>
                </ul>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.favorite.disappear.title") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.favorite.contents.0") }}
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.subber.title") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.subber.contents.0") }}
                <a href="https://forms.gle/xkN4w8fyPr6YTGfx6">
                  {{ $t("about.faq.subber.contents.1") }}
                </a>
                {{ $t("about.faq.subber.contents.2") }}
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.videoLinkage") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.videoLinkageContent") }}
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.quitHolodex") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.quitHolodexContent") }}
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.feedback.title") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.faq.feedback.contents.0") }}
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.faq.support.title") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div v-html="$t('about.faq.support.contents.0')" />
                <button
                  class="btn btn-sm btn-primary btn-wide mt-2"
                  href="https://ko-fi.com/holodex"
                >
                  Ko-fi: Support Holodex
                </button>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ $t("about.gdpr") }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                {{ $t("about.gdprContent") }}
                <b>{{ $t("about.gdprDeletion") }}</b>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
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
                class="text-left mt-4 white--text grey"
                href="javascript:(function(){var v=new%20URLSearchParams(window.location.search).get('v');v&&(window.location.href='https://holodex.net/watch/'+v)})()"
              >
                Open in Holodex
              </v-btn>
              <v-btn
                class="text-left mt-4 white--text grey"
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
import {
  mdiExportVariant,
  mdiGithub,
  mdiConsole,
  mdiAccountPlus,
  mdiPuzzleOutline,
} from "@mdi/js";

export default defineComponent({
  name: "About",
  components: {},
  data() {
    return {
      mdiExportVariant,
      mdiPuzzleOutline,
      mdiGithub,
      mdiConsole,
      mdiAccountPlus,
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
