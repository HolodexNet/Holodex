<template>
    <v-container class="pt-3">
        <v-row>
            <v-col cols="12">
                <div class="text-h4">{{ $t("component.mainNav.about") }}</div>
            </v-col>
            <v-col cols="12" md="4" sm="4" lg="3" xl="2" float-right>
                <div class="text-h5">News</div>
                <TwitterFeed :key="'twtrTimeline' + timelinekey" />
            </v-col>

            <v-col cols="12" md="8" sm="8" lg="9" xl="10">
                <v-alert dense text type="info">
                    We are aware of an issue regarding Live Chat not working, some reports suggest clearing cookies for
                    youtube.com and holodex.net fixes it. The issue is most likely on Youtube's end, but we are still
                    investigating work arounds
                </v-alert>
                <div class="text-h5">Quick Links</div>

                <v-btn color="indigo" class="ma-3" large href="https://discord.gg/jctkgHBt4b">
                    <v-icon left>{{ icons.mdiDiscord }}</v-icon>
                    Holodex Discord
                </v-btn>
                <br />
                <v-btn color="info" class="ma-3" large href="https://forms.gle/xkN4w8fyPr6YTGfx6">
                    <v-icon left>{{ icons.mdiPencil }}</v-icon>
                    {{ $t("views.about.add_my_channel") }}
                </v-btn>
                <br />
                <v-btn color="teal" class="ma-3" large href="https://discord.gg/xJd9Der">
                    <v-icon left>{{ icons.mdiDiscord }}</v-icon>
                    Hololive Creators Discord (#holodex)
                </v-btn>
                <br />
                <v-btn class="ma-3" large href="https://github.com/RiceCakess/Holodex">
                    <v-icon left>{{ mdiGithub }}</v-icon>
                    Issue Tracker / Source
                </v-btn>
                <div class="text-h5">FAQ</div>
                <v-expansion-panels>
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
                            How do I make sure that videos are tagged properly?
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            All information is parsed from the video description. If you are clipping a stream, please
                            make sure to link the official stream. If you are clipping fan made content (eg. from
                            bilibili), just make sure to link the official channels of relevant vtubers.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            I'm a subber and I would like to have my channel removed from Holodex
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Sad to see you go :(, please let me know if there's any issue I can help you with. If you
                            would still like to have it removed, please send me a message on Discord.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            I have feedback/want to contribute to this project
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            All help and ideas are welcome! The project is currently in a private repo, but I hope to
                            make it public once I clean up the code, in the mean time, feel free to contact me directly
                            and I'll add you on.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header> GDPR and my data </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            A Google Analytics cookie is used to track pageviews for our analytical purposes. After
                            login, we associate your social media account username and ID with your favorites. This data
                            may include your Email (for Google), Discord ID, or Twitter handle respectively.
                            <b>For deletion of your user data, please contact us on discord!</b>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
                <br />

                <div class="text-h5">Feedback/Bug Reports</div>
                <p class="text-body-2">
                    You can create an issue in the
                    <a href="https://github.com/RiceCakess/Holodex/issues"> Github Issue Tracker </a>
                    or find the Holodex team on Discord
                    <br />
                    <br />
                    Discord: #holodex channel on
                    <a href="https://discord.gg/xJd9Der"> Hololive Creators Club Discord </a>
                    <br />
                    Reddit:
                    <a href="https://www.reddit.com/user/Rice_Cakess/"> u/Rice_cakess </a>
                </p>
                <br />

                <div class="text-h5">Credits</div>
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
                    <br />
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

<script>
import { mdiExportVariant, mdiGithub } from "@mdi/js";
import * as icons from "@/utils/icons";
import TwitterFeed from "@/components/common/TwitterFeed";

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
