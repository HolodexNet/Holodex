<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="text-h4">About</div>
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
                <div class="text-h5">FAQ</div>
                <v-expansion-panels>
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
                            to to clear the site's local storage. There is no
                            permanent way to save your favorites list, but I am
                            open to implementing accounts or exporting a txt.
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
                            HoloDex
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            Please check on the Channels page to see if you are
                            listed as a subber, if not please contact me on
                            Discord or Reddit, and I will add you manually. If
                            you are already on the list, please make sure your
                            video has the correct youtube source/channel links.
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
                            removed from HoloDex
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
                <div class="text-h5">Contact</div>
                <div>
                    Discord: ricecakes#8102 on the
                    <a href="https://discord.gg/xJd9Der">
                        Hololive Creators Club Discord
                    </a>
                </div>
                <div>
                    Reddit:
                    <a href="https://www.reddit.com/user/Rice_Cakess/"
                        >u/Rice_cakess</a
                    >
                </div>
                <br />
                <p class="text-body-2">
                    This is a fan made website and the content found on this
                    website is owned by Cover corp and its partners. The site
                    follows the guidelines set forth by Cover corp in their
                    <a href="https://en.hololive.tv/terms">
                        Derivative Work License Agreement
                    </a>
                </p>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "About",
};
</script>

<style></style>
