<template>
  <v-container
    key="aboutpg"
    class="pt-3"
  >
    <v-row>
      <v-col
        v-if="!$store.state.isMobile"
        cols="12"
      >
        <div class="text-h4">
          {{ $t("component.mainNav.about") }}
        </div>
      </v-col>
      <v-col cols="12">
        <stats />
      </v-col>
      <v-col
        cols="12"
        md="4"
        lg="4"
        xl="3"
        float-right
      >
        <v-card class="pa-0">
          <!-- <div class="text-h5 mb-2">
                        {{ $t("about.news.title") }}
                    </div> -->
          <TwitterFeed :key="'twtrTimeline' + timelinekey" />
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="4"
        lg="4"
        xl="3"
      >
        <v-card>
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
              target="_blank"
              href="https://forms.gle/xkN4w8fyPr6YTGfx6"
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
              {{ $t('views.extension.title') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="4"
        lg="4"
        xl="4"
      >
        <v-card>
          <v-card-title>
            <div class="text-h6">
              {{ $t("about.credits.title") }}
            </div>
          </v-card-title>
          <v-card-text>
            <p class="text-body-2">
              {{ $t("about.credits.contents[0]") }}
              <a href="https://hololive.jetri.co/">HoloTools</a> {{ $t("about.credits.contents[1]") }}
              <a href="https://github.com/holofans/holoapi">holoapi</a>.
              <br>
              {{ $t("about.credits.contents[2]") }}
            </p>
            <br>
            <p class="text-body-2">
              {{ $t("about.credits.contents[3]") }}
              <a href="https://en.hololive.tv/terms"> {{ $t("about.credits.contents[4]") }} </a>
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
        lg="6"
        xl="6"
      >
        <v-card>
          <v-card-title>
            <div class="text-h6">
              {{ $t("about.faq.title") }}
            </div>
          </v-card-title>
          <v-expansion-panels
            accordion
            focusable
          >
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.ytchatHeader") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.ytchatContent") }}
                <br>
                <a href="https://support.mozilla.org/en-US/kb/third-party-cookies-firefox-tracking-protection?redirectslug=disable-third-party-cookies">
                  {{ $t("about.faq.ytchatFirefox") }}
                </a>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.autoplayHeader") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.autoplayContent") }}
                <br>
                <br>Safari: <br>
                <img
                  width="80%"
                  src="https://www.imore.com/sites/imore.com/files/styles/large/public/field/image/2017/07/safari-custom-settings-websites-mac-screenshot-06.jpg?itok=ONVYTcno"
                >
                <br>Firefox: <br>
                <img
                  width="80%"
                  src="https://ffp4g1ylyit3jdyti1hqcvtb-wpengine.netdna-ssl.com/firefox/files/2019/04/Screen-Shot-2019-04-01-at-11.21.21-AM.png"
                >
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.musicPlayer") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-html="$t('about.faq.musicPlayerContent')" />
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header> {{ $t("about.faq.mobile.title") }} </v-expansion-panel-header>
              <v-expansion-panel-content>
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
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.favorite.disappear.title") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.favorite.contents.0") }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.subber.title") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.subber.contents.0") }}
                <a href="https://forms.gle/xkN4w8fyPr6YTGfx6"> {{ $t("about.faq.subber.contents.1") }} </a>
                {{ $t("about.faq.subber.contents.2") }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.videoLinkage") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.videoLinkageContent") }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.quitHolodex") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.quitHolodexContent") }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.feedback.title") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.feedback.contents.0") }}
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header> {{ $t("about.gdpr") }} </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.gdprContent") }}
                <b>{{ $t("about.gdprDeletion") }}</b>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-card-title>
            <a
              class="text-h6"
              href="https://github.com/RiceCakess/Holodex/blob/dev/CHANGELOG.md"
            >{{
              $t("about.changelog.title")
            }}</a>
          </v-card-title>
          <div>
            <iframe
              width="100%"
              seamless
              src="https://holodexnet.github.io/Holodex/CHANGELOG.html"
              style="height: 60vh; border: none; background: #eee"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="4"
        lg="4"
        xl="4"
      >
        <v-card>
          <v-card-title>
            <div class="text-h6">
              {{ $t("about.bookmarklet.title") }}
            </div>
          </v-card-title>
          <v-card-text>
            <p>{{ $t('about.bookmarklet.description') }}</p>
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
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
    mdiExportVariant, mdiGithub, mdiConsole, mdiAccountPlus, mdiPuzzleOutline,
} from "@mdi/js";
import TwitterFeed from "@/components/common/TwitterFeed.vue";
import Stats from "@/components/common/Stats.vue";

export default {
    name: "About",
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.about")} - Holodex`;
            },
        };
    },
    components: {
        TwitterFeed,
        Stats,
    },
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
};
</script>

<style>
.v-expansion-panel-content__wrap {
  padding-top: 12px;
}
</style>
