<template>
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
            <span class="i-ph:export"></span>
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
          class="mt-2 btn btn-sm btn-primary btn-wide"
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
</template>
