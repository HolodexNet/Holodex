<template>
  <v-container key="aboutpg" class="d-flex flex-column align-center pt-3">
    <v-col v-if="!$store.state.isMobile" cols="12">
      <div class="text-h4">
        {{ $t("component.mainNav.about") }}
      </div>
    </v-col>
    <!-- STATS -->
    <stats />
    <v-row class="flex-row">
      <v-col
        cols="12"
        md="4"
        lg="4"
        xl="4"
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
              {{ $t("about.credits.title") }}
            </div>
          </v-card-title>
          <v-card-text>
            <p class="text-body-2">
              {{ $t("about.credits.contents[0]") }}
              <a href="https://hololive.jetri.co/">HoloTools</a>
              {{ $t("about.credits.contents[1]") }}
              <a href="https://github.com/holofans/holoapi">holoapi</a>.
              <br>
              {{ $t("about.credits.contents[2]") }}
            </p>
            <br>
            <p class="text-body-2">
              {{ $t("about.credits.contents[3]") }}
              <a href="https://en.hololive.tv/terms">
                {{ $t("about.credits.contents[4]") }}
              </a>
            </p>
            <br>
            <p>
              By using this site you are agreeing to be bound by the
              <a href="https://www.youtube.com/t/terms">Youtube Terms of Service</a>
            </p>
          </v-card-text>
        </v-card>
        <!-- LINKS -->
        <v-card style="margin-top: 36.5px">
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

      <v-col
        cols="12"
        md="4"
        lg="4"
        xl="4"
      >
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
            style="
              height: 606px;
              margin-bottom: -16.5px;
              border: none;
              background: #eee;
            "
          />
        </v-card>
      </v-col>
    </v-row>
    <v-row class="flex-row justify-center">
      <!-- FAQ -->
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
          <v-expansion-panels accordion focusable>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.faq.ytchatHeader") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.faq.ytchatContent") }}
                <br>
                <a
                  href="https://support.mozilla.org/en-US/kb/third-party-cookies-firefox-tracking-protection?redirectslug=disable-third-party-cookies"
                >
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
                {{ $t("about.faq.mobile.title") }}
              </v-expansion-panel-header>
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
                <a href="https://forms.gle/xkN4w8fyPr6YTGfx6">
                  {{ $t("about.faq.subber.contents.1") }}
                </a>
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
              <v-expansion-panel-header>
                {{ $t("about.faq.support.title") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-html="$t('about.faq.support.contents.0')" />
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.privacyPolicy") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <p style="">
                  This Privacy Policy governs the manner in which Holodex
                  collects, uses, maintains, and discloses information collected
                  from users (each, a "User") of the Holodex website ("Site").
                  This privacy policy applies to the Site and all products and
                  services offered by Holodex.
                </p>

                <h4>Holodex First Party Information collection and usage:</h4>

                <p>
                  We collect limited personal identification information from
                  Users in a variety of ways, including, but not limited to,
                  when Users visit our Site, register on the Site, fill out a
                  form, and in connection with other activities, services,
                  features or resources we make available on our Site.
                </p>

                <p>
                  We will collect personal identification information from Users
                  only if they voluntarily submit such information to us. Users
                  can always refuse to supply personal identification
                  information and use the Site without logging in.
                </p>

                <p>
                  i) Information Access: When you log in using your social media
                  account, we will only access the basic information required to
                  facilitate your login. This typically includes your email
                  address or social media handle. We will not retrieve or store
                  any other personal data from your social media account. We
                  will also store the minimum amount of ID or email handle used
                  to distinctly link a Holodex account with a Social Media
                  Account so we may facilitate future logins.
                </p>

                <p>
                  ii) Limited Use: The information obtained from your social
                  media account is solely for the purpose of allowing you to log
                  into our service. We will not use this information for
                  identification purposes outside of this function or share it
                  with third parties without your explicit consent.
                </p>

                <p>
                  iii) No Posting: We will not post any content to your social
                  media accounts on your behalf or access your contacts,
                  friends, or followers.
                </p>

                <p>
                  iv) Revoking Access: You can revoke our access to your social
                  media account at any time through your social media platform's
                  settings. Revoking our access will not affect your account
                  with us, but you may need to set up an alternative login
                  method for our service.
                </p>

                <p>
                  Changes to This Clause: Any changes to our social media login
                  policy will be updated on this page. We recommend that you
                  periodically review this clause for any changes.
                </p>

                <h4>Third Party Information collection and usage:</h4>

                <h5>1. Google Analytics</h5>
                <p>
                  We use Google Analytics, a service provided by Google, Inc.,
                  to analyze our website traffic. Google Analytics utilizes
                  cookies to track visitor interactions and collects information
                  about how visitors use our site. This data might include your
                  IP address, browser type, browser version, the pages of our
                  site that you visit, the time and date of your visit, the time
                  spent on those pages, and other statistics.
                </p>

                <p>
                  The data collected is primarily used to report on website
                  usage to help us understand our visitors' preferences and to
                  enhance the user experience. Please refer to Google's privacy
                  policy.
                </p>

                <h5>2. YouTube & Twitch Embeds</h5>
                <p>
                  Our website may feature embedded videos from YouTube (owned by
                  Google, Inc.) or Twitch (owned by Twitch Interactive, Inc.).
                  When you watch these videos, these platforms may set cookies
                  on your device and collect data such as your IP address, your
                  browser type, and the page you visited on our site.
                </p>

                <p>
                  We've added links below to their respective privacy policies.
                </p>

                <h5>Your Choices</h5>
                <p>
                  You can control and limit the data that third-party services
                  collect by using the respective settings in your browser or
                  device and by consulting the privacy settings specific to each
                  third-party service.
                </p>

                <h4>Contact Us about Privacy</h4>

                <p>
                  If you have concerns about the data these third parties
                  collect or wish to find out more about your data protection
                  rights, we encourage you to visit their respective privacy
                  policies.
                </p>

                <p>
                  Your privacy is of paramount importance to us, and we are
                  committed to ensuring the best standards are upheld. If you
                  have any questions or concerns regarding our use of social
                  media logins, please contact our team on discord.
                </p>

                <a href="https://policies.google.com/privacy">Google and Youtube Privacy Policy</a>
                <br>
                <a href="https://www.twitch.tv/p/en/legal/privacy-notice/">Twitch Privacy Policy</a>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                {{ $t("about.gdpr") }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                {{ $t("about.gdprContent") }}
                <b>{{ $t("about.gdprDeletion") }}</b>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
      <!-- BOOKMARKLETS -->
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
            <p>{{ $t("about.bookmarklet.description") }}</p>
            <div class="d-flex flex-column" style="margin-left: 0px">
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
