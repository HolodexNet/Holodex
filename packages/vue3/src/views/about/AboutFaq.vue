<template>
  <h-disclosure :title="$t('about.faq.ytchatHeader')" default-open>
    {{ $t("about.faq.ytchatContent") }}
    <br />
    <a
      href="https://support.mozilla.org/en-US/kb/third-party-cookies-firefox-tracking-protection?redirectslug=disable-third-party-cookies"
      class="link text-primary"
    >
      {{ $t("about.faq.ytchatFirefox") }}
    </a>
  </h-disclosure>
  <h-disclosure :title="$t('about.faq.autoplayHeader')">
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
  </h-disclosure>
  <h-disclosure :title="$t('about.faq.mobile.title')">
    {{ $t("about.faq.mobile.content.summary") }}
    <ul>
      <li>
        {{ $t("about.faq.mobile.content.android.0") }}
        <h-icon
          class="i-mdi:dots-vertical inline-block text-primary"
          color="primary"
        ></h-icon>
        {{ $t("about.faq.mobile.content.android.1") }}
      </li>
      <li>
        {{ $t("about.faq.mobile.content.ios.0") }}
        <span class="i-ph:export"></span>
        {{ $t("about.faq.mobile.content.ios[1]") }}
      </li>
    </ul>
  </h-disclosure>

  <h-disclosure :title="$t('about.faq.favorite.disappear.title')">
    {{ $t("about.faq.favorite.contents.0") }}
  </h-disclosure>

  <h-disclosure :title="$t('about.faq.subber.title')">
    {{ $t("about.faq.subber.contents.0") }}
    <a href="https://forms.gle/xkN4w8fyPr6YTGfx6">
      {{ $t("about.faq.subber.contents.1") }}
    </a>
    {{ $t("about.faq.subber.contents.2") }}
  </h-disclosure>

  <h-disclosure :title="$t('about.faq.videoLinkage')">
    {{ $t("about.faq.videoLinkageContent") }}
  </h-disclosure>

  <h-disclosure :title="$t('about.faq.quitHolodex')">
    {{ $t("about.faq.quitHolodexContent") }}
  </h-disclosure>

  <h-disclosure :title="$t('about.faq.feedback.title')">
    {{ $t("about.faq.feedback.contents.0") }}
  </h-disclosure>

  <h-disclosure :title="$t('about.faq.support.title')">
    <div v-html="$t('about.faq.support.contents.0')" />
    <button
      class="btn btn-primary btn-sm btn-wide mt-2"
      href="https://ko-fi.com/holodex"
    >
      Ko-fi: Support Holodex
    </button>
  </h-disclosure>

  <h-disclosure :title="$t('about.gdpr')">
    {{ $t("about.gdprContent") }}
    <b>{{ $t("about.gdprDeletion") }}</b>
  </h-disclosure>
</template>
<script setup lang="ts"></script>
