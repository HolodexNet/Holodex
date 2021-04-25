<template>
    <v-container class="pt-3">
        <v-row>
            <v-col cols="12" v-if="!$store.state.isMobile">
                <div class="text-h4">{{ $t("component.mainNav.about") }}</div>
            </v-col>
            <v-col cols="12" md="4" sm="4" lg="3" xl="2" float-right>
                <div class="text-h5 mb-2">{{ $t("about.news.title") }}</div>
                <TwitterFeed :key="'twtrTimeline' + timelinekey" />
            </v-col>

            <v-col cols="12" md="8" sm="8" lg="9" xl="10">
                <div class="text-h5 mb-2">{{ $t("about.quicklinks") }}</div>

                <v-row dense class="mx-1">
                    <v-col cols="12" md="auto">
                        <v-btn
                            color="indigo"
                            block
                            class="text-left justify-start"
                            large
                            href="https://discord.gg/jctkgHBt4b"
                        >
                            <v-icon large left>{{ icons.mdiDiscord }}</v-icon>
                            {{ $t("about.discordBtn") }}
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="auto">
                        <v-btn
                            color="info"
                            block
                            class="text-left justify-start"
                            large
                            href="https://forms.gle/xkN4w8fyPr6YTGfx6"
                        >
                            <v-icon large left>{{ icons.mdiPencil }}</v-icon>
                            {{ $t("views.about.add_my_channel") }}
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="auto">
                        <v-btn
                            color="teal"
                            block
                            class="text-left justify-start"
                            large
                            href="https://discord.gg/xJd9Der"
                        >
                            <v-icon large left>{{ icons.mdiDiscord }}</v-icon>
                            Hololive Creators (#holodex)
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="auto">
                        <v-btn class="text-left justify-start" block large href="https://github.com/RiceCakess/Holodex">
                            <v-icon large left>{{ mdiGithub }}</v-icon>
                            {{ $t("about.issueTracker") }}
                        </v-btn>
                    </v-col>
                </v-row>

                <div class="text-h5 mb-2 mt-4">{{ $t("about.faq.title") }}</div>
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            {{ $t("about.faq.ytchatHeader") }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            {{ $t("about.faq.ytchatContent") }}
                            <br />
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
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            {{ $t("about.faq.musicPlayer") }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-html="$t('about.faq.musicPlayerContent')"></div>
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
                        <v-expansion-panel-header> {{ $t("about.faq.favorite.title") }} </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            {{ $t("about.faq.favorite.Contents.0") }}
                            <router-link to="/channel">{{ $t("component.mainNav.channels") }}</router-link>
                            {{ $t("about.faq.favorite.Contents[1]") }}
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
                        <v-expansion-panel-header> {{ $t("about.faq.MugenClips.title") }} </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            {{ $t("about.faq.MugenClips.contents.0") }}
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
                <br />

                <div class="text-h5">{{ $t("about.feedback") }}</div>
                <p class="text-body-2" v-html="$t('about.feedbackHtml')"></p>
                <br />

                <div class="text-h5" id="changelog">{{ $t("about.credits.title") }}</div>
                <p class="text-body-2">
                    {{ $t("about.credits.contents[0]") }}
                    <a href="https://hololive.jetri.co/">HoloTools</a> {{ $t("about.credits.contents[1]") }}
                    <a href="https://github.com/holofans/holoapi">holoapi</a>.
                    <br />
                    {{ $t("about.credits.contents[2]") }}
                </p>
                <br />
                <p class="text-body-2">
                    {{ $t("about.credits.contents[3]") }}
                    <a href="https://en.hololive.tv/terms"> {{ $t("about.credits.contents[4]") }} </a>
                </p>
                <br />

                <a class="text-h5" href="https://github.com/RiceCakess/Holodex/blob/dev/CHANGELOG.md">{{
                    $t("about.changelog.title")
                }}</a>
                <div class="text-body-2">
                    <iframe
                        width="100%"
                        height="500px"
                        seamless
                        src="https://ricecakess.github.io/Holodex/"
                        style="border: none; border-radius: 3px; background: #eee"
                    ></iframe>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { mdiExportVariant, mdiGithub } from "@mdi/js";
import * as icons from "@/utils/icons";
import TwitterFeed from "@/components/common/TwitterFeed.vue";

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
    },
    activated() {
        this.timelinekey += 1;
    },
    data() {
        return {
            icons,
            mdiExportVariant,
            mdiGithub,
            timelinekey: 12,
        };
    },
};
</script>

<style></style>
