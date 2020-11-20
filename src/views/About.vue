<template>
    <v-container class="pt-0">
        <v-row>
            <v-col cols="12">
                <div class="text-h4">About</div>
            </v-col>
            <v-col cols="12" md="4" sm="4" lg="3" xl="2" float-right>
                <div class="text-h5">News</div>
                <TwitterFeed />
            </v-col>

            <v-col cols="12" md="8" sm="8" lg="9" xl="10">
                <div class="text-h5">FAQ</div>
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Is there an Android/iOS app for Holodex?
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            No, but you can add the website to your Home screen,
                            and it will behave like a native app (with a few
                            quirks). It is still a work-in-progress, so please
                            leave any feedback or bug report!
                            <ul>
                                <li>
                                    Android Chrome: Navigate to the site, click
                                    the three dots
                                    <v-icon color="primary">
                                        {{ mdiDotsVertical }}
                                    </v-icon>
                                    on the top right and find "Add to Home
                                    Screen".
                                </li>
                                <li>
                                    iOS Safari: Navigate to the site on your
                                    phone, click the square with arrow pointing
                                    up
                                    <v-icon color="primary">
                                        {{ mdiExportVariant }}
                                    </v-icon>
                                    at the bottom of safari, and click "Add to
                                    Home Screen"
                                </li>
                            </ul>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            What are favorites?
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Favorites are a way to stay on top of your favorite
                            vtubers, you can add your favorite channels by
                            clicking the heart icon on the
                            <router-link to="/channel">Channels</router-link>
                            page. Please note that favoriting subbers is
                            currently not supported, but you should still
                            consider subscribing and supporting them in other
                            ways!
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            My favorites list disappeared!
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Favorites are currently stored locally, so try not
                            to to clear the site's local storage. Deleting
                            Cache/Cookies is ok!
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Some of my favorites does not appear
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Try visiting the Channels page and refreshing, if
                            that doesn't solve it, you may have to clear
                            storage/cache and start over.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            I'm a subber and can't find my channel or clips on
                            Holodex
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Please check on the Channels page to see if you are
                            listed as a subber, if not please fill out
                            <a href="https://forms.gle/xkN4w8fyPr6YTGfx6">
                                this form
                            </a>
                            , and we will add you manually. If you are already
                            on the list, please make sure your video
                            descriptions have the correct youtube source/channel
                            links.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            How do I make sure that videos are tagged properly?
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            All information is parsed from the video
                            description. If you are clipping a stream, please
                            make sure to link the official stream. If you are
                            clipping fan made content (eg. from bilibili), just
                            make sure to link the official channels of relevant
                            vtubers. Add relevant hashtags (eg. #apexlegends)
                            and try to minimize variations. You can check the
                            tags page to see what already exists and try to
                            reuse existing tags
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            I'm a subber and I would like to have my channel
                            removed from Holodex
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Sad to see you go :(, please let me know if there's
                            any issue I can help you with. If you would still
                            like to have it removed, please send me a message on
                            Discord or Reddit.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            I have feedback/want to contribute to this project
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            All help and ideas are welcome! The project is
                            currently in a private repo, but I hope to make it
                            public once I clean up the code, in the mean time,
                            feel free to contact me directly and I'll add you
                            on.
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
                <br />

                <div class="text-h5">Feedback/Bug Reports</div>
                <p class="text-body-2">
                    You can create an issue in the
                    <a href="https://github.com/RiceCakess/Holodex/issues">
                        Github Issue Tracker
                    </a>
                    or find the Holodex team on Discord
                    <br />
                    <br />
                    Discord: #holodex channel on
                    <a href="https://discord.gg/xJd9Der">
                        Hololive Creators Club Discord
                    </a>
                    <br />
                    Reddit:
                    <a href="https://www.reddit.com/user/Rice_Cakess/">
                        u/Rice_cakess
                    </a>
                </p>
                <br />

                <div class="text-h5">Credits</div>
                <p class="text-body-2">
                    I would like to give big thanks to the
                    <a href="https://hololive.jetri.co/">HoloTools</a> team for
                    their work on
                    <a href="https://github.com/holofans/holoapi">holoapi</a>.
                    <br />
                    Also to all the subbers for helping the overseas bros!
                    Please check them out!
                </p>
                <br />
                <p class="text-body-2">
                    This is a fan made website and the content found on this
                    website is owned by Cover corp and its partners. The site
                    follows the guidelines set forth by Cover corp in their
                    <a href="https://en.hololive.tv/terms">
                        Derivative Work License Agreement
                    </a>
                </p>
                <br />

                <div class="text-h5">Changelog</div>
                <div class="text-body-2">
                    <span class="text--secondary">November 17, 2020</span>
                    <ul>
                        <li>
                            Holodex is now offered in different languages: JP,
                            ZH-TW, ES, ID, MS, RU. Translations are provided by
                            the community, thank you!
                        </li>
                        <li>Watched videos are now highlighted in purple</li>
                        <li>
                            Save videos to your library by clicking on the +
                            icon.
                        </li>
                        <li>
                            Use the library to manage your saved videos or
                            export it to a standard youtube playlist
                        </li>
                        <li>
                            Clicking on "x clips", while in redirect mode takes
                            you to the Holodex page
                        </li>
                        <li>
                            Live videos now show time in hours and minutes from
                            now
                        </li>
                    </ul>
                    <br />
                    <span class="text--secondary">November 2, 2020</span>
                    <ul>
                        <li>Hotfix video duration</li>
                        <li>
                            Added more sorting options and card view to Channels
                            page
                        </li>
                        <li>
                            Added Hololive generation/group name to each Vtuber
                        </li>
                        <li>
                            Added filtering by official/clips for favorites page
                        </li>
                        <li>
                            Added loading screen and errors to all the pages
                        </li>
                        <li>
                            Clicking on the same page on desktop now refreshes
                            the page
                        </li>
                        <li>
                            Inactive vtuber channels are now hidden, but you can
                            still view them through the search bar
                        </li>
                        <li>Add hide live chat button</li>
                        <li>General under the hood improvments</li>
                    </ul>
                    <br />
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
import { mdiDotsVertical, mdiExportVariant } from "@mdi/js";
import TwitterFeed from "@/components/TwitterFeed";

export default {
    name: "About",
    metaInfo: {
        title: "About",
    },
    components: {
        TwitterFeed,
    },
    data() {
        return {
            mdiExportVariant,
            mdiDotsVertical,
        };
    },
};
</script>

<style></style>
