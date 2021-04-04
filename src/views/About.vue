<template>
    <v-container class="pt-3">
        <v-row>
            <v-col cols="12" v-if="!$store.state.isMobile">
                <div class="text-h4">{{ $t("component.mainNav.about") }}</div>
            </v-col>
            <v-col cols="12" md="4" sm="4" lg="3" xl="2" float-right>
                <div class="text-h5 mb-2">News</div>
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
                        <v-expansion-panel-header> Is there an Android/iOS app for Holodex? </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            We are working on it! In the mean time, please use the "Add to Home" feature on your
                            browser. We have tuned it a lot to behave like an app
                            <ul>
                                <li>
                                    Android Chrome: Navigate to the site, click the three dots
                                    <v-icon color="primary">
                                        {{ icons.mdiDotsVertical }}
                                    </v-icon>
                                    on the top right and find "Add to Home Screen".
                                </li>
                                <li>
                                    iOS Safari: Navigate to the site on your phone, click the square with arrow pointing
                                    up
                                    <v-icon color="primary">
                                        {{ mdiExportVariant }}
                                    </v-icon>
                                    at the bottom of safari, and click "Add to Home Screen"
                                </li>
                            </ul>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header> What are favorites? </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Favorites are a way to stay on top of your favorite vtubers, you can add your favorite
                            channels by clicking the heart icon on the
                            <router-link to="/channel">Channels</router-link>
                            page. Please note that favoriting subbers is currently not supported, but you should still
                            consider subscribing and supporting them in other ways!
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            My favorites list disappeared / I cannot favorite
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Please make sure you are logged in and visit the channels favorites tab to force a refresh.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header> What is MugenClips? </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            MugenClips, or infinite clips, is a watch along party where people on the site can watch a
                            constantly rotating variety of clips uploaded by the many community translation channels
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            I'm a subber and can't find my channel or clips on Holodex
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Please check on the Channels page to see if you are listed as a subber, if not please fill
                            out
                            <a href="https://forms.gle/xkN4w8fyPr6YTGfx6"> this form </a>
                            , and we will add you manually. If you are already on the list, please make sure your video
                            descriptions have the correct youtube source/channel links.
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
                            I have feedback/want to contribute to this project
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            All help and ideas are welcome! The UI and Backend are both available for contribution,
                            although only the UI is open source currently. Please contact us on discord to gain access
                            to backend source, or simply chat about your ideas.
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

                <div class="text-h5" id="changelog">Credits</div>
                <p class="text-body-2">
                    I would like to give big thanks to the
                    <a href="https://hololive.jetri.co/">HoloTools</a> team for their work on
                    <a href="https://github.com/holofans/holoapi">holoapi</a>.
                    <br />
                    Also to all the subbers for helping the overseas bros! Please check them out!
                </p>
                <br />
                <p class="text-body-2">
                    This is a fan made website and the content found on this website is owned by Cover corp and its
                    partners. The site follows the guidelines set forth by Cover corp in their
                    <a href="https://en.hololive.tv/terms"> Derivative Work License Agreement </a>
                </p>
                <br />

                <div class="text-h5">Changelog</div>
                <div class="text-body-2">
                    <span class="text--secondary">March 26th, 2021</span> <br />
                    <span class="text-body-1">Holodex V2.1 Main Features</span>
                    <ul>
                        <li>
                            Added <b>MultiView</b> functionality, with customizable layouts supporting everything a DD
                            wants. <b>Also works on mobile</b>, if your phone is powerful enough (on some mobile devices
                            and platforms, you can only hear one stream's audio, but can play multiple videos.).
                        </li>
                        <li>
                            Isolated Stream-Translations chat built into Mobile and Desktop views, you can also get
                            Live-TL-esque features on Mobile (and desktop).
                        </li>
                        <li>Massive improvements to mobile experience.</li>
                        <li>
                            Removed top status bar from the App version of the website, but may require a reinstall for
                            some platforms.
                        </li>
                        <li>
                            Added Music Player / Music Curation platform. You can browse, search, and listen to karaoke
                            streams / covers as if it is Spotify. Best part is, the views go towards the singer (instead
                            of clippers who split the Karaoke stream into pieces). Everyone can contribute and create
                            music annotations, so feel free to help out your oshi by tagging their karaoke songs.
                        </li>
                        <li>
                            Normal users are now able to add topics (and music) annotation to videos. If you want us to
                            add new topics into Holodex, please join our discord and recommend it!
                        </li>
                        <li>
                            Editors are now more powerful on Holodex, being able to change topics and delete/update song
                            information. Users interested in becoming Holodex editors should talk to us on discord.
                        </li>
                        <li>Made light mode pretty</li>
                        <li>
                            Logged in users can now request for an API Key on the Account page, we will require API Key
                            for CORS requests into Holodex backend in the short future.
                        </li>
                    </ul>
                    <span class="text-body-1">New Localizations:</span>
                    <ul>
                        <li>Added pt-BR locale.</li>
                    </ul>
                    <span class="text-body-1">Bugfixes:</span>
                    <ul>
                        <li>Twitter login works again!</li>
                        <li>Cleaned up video export to Youtube with a guide</li>
                        <li>We now check when a video use @CHANNEL NAME in description to mention vtubers.</li>
                        <li>Improved usability across the website.</li>
                    </ul>
                    <br />
                    <br />
                    <span class="text--secondary">January 29th, 2021</span>
                    <ul>
                        <li>
                            Added ability to change video thumbnail/grid sizes for Home/Favorites (use the icon on the
                            top right)
                        </li>
                        <li>Added setting to enable/disable autoplay videos</li>
                        <li>Added French localization</li>
                        <li>
                            Added ScrollMode setting to switch between infinite scroll loading and page by page
                            navigation
                        </li>
                        <li>Frontend is now open source!</li>
                        <li>Fixed lots of bugs and introduced new ones probably</li>
                    </ul>
                    <br />
                    <br />
                    <!-- <span class="text--secondary">January 29th, 2021</span>
                    <ul>
                        <li>
                            Added ability to change video thumbnail/grid sizes for Home/Favorites (use the icon on the
                            top right)
                        </li>
                        <li>Added setting to enable/disable autoplay videos</li>
                        <li>Added French localization</li>
                        <li>
                            Added ScrollMode setting to switch between infinite scroll loading and page by page
                            navigation
                        </li>
                        <li>Frontend is now open source!</li>
                        <li>Fixed lots of bugs and introduced new ones probably</li>
                    </ul>
                    <br />
                    <br />
                    <span class="text--secondary">January 20th, 2021</span>
                    <ul>
                        <li>Massive upgrade to support over 600+ Vtuber channels and 1000+ clipping channels</li>
                        <li>Added user accounts to sync favorites across devices</li>
                        <li>
                            Added support for tracking clippers in a variety of languages, head over to the settings to
                            set the langauges you want to see clips in
                        </li>
                        <li>Added topics to each list and improved search</li>
                        <li>New and improved watch page with theather mode and top comments</li>
                        <li>
                            Laid groundwork for more features in the future, including a new user contributed tagging
                            system, song tracking and more!
                        </li>
                    </ul>
                    <br />
                    <br /> -->
                    <!-- <span class="text--secondary">November 2, 2020</span>
                    <ul>
                        <li>Hotfix video duration</li>
                        <li>Added more sorting options and card view to Channels page</li>
                        <li>Added Hololive generation/group name to each Vtuber</li>
                        <li>Added filtering by official/clips for favorites page</li>
                        <li>Added loading screen and errors to all the pages</li>
                        <li>Clicking on the same page on desktop now refreshes the page</li>
                        <li>
                            Inactive vtuber channels are now hidden, but you can still view them through the search bar
                        </li>
                        <li>Add hide live chat button</li>
                        <li>General under the hood improvments</li>
                    </ul>
                    <br /> -->
                    <!-- <span class="text--secondary">Oct 20, 2020</span>
                    <ul>
                        <li>
                            Added instructions on how to use Holodex like an app
                        </li>
                        <li>
                            Added a
                            <a
                                href="https://github.com/RiceCakess/Holodex/issues"
                            >
                                Github Issue Tracker
                            </a>
                        </li>
                    </ul>
                    <br />
                    <span class="text--secondary">Oct 19, 2020</span>
                    <ul>
                        <li>
                            Added live chat window for upcoming/live streams.
                            (Mobile not supported, due to Youtube-kun's rules)
                        </li>
                        <li>Hovering over video title shows full title</li>
                        <li>Fixed collab typo</li>
                        <li>Hide clips and collabs tab for clippers</li>
                    </ul> -->
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
