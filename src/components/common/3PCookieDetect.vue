<template>
    <div>
        <v-alert
            v-if="shouldTestTPCookie && tpCookieTested"
            border="top"
            color="error"
            type="error"
            elevation="4"
            dismissible
            class="alert-overlay"
            transition="scroll-y-transition"
            :value="true"
        >
            <div @click.stop="dialogOpen = true">
                {{ $t("component.thirdpartycookie.alertText") }}
            </div>
        </v-alert>
        <v-dialog v-if="dialogOpen" v-model="dialogOpen" max-width="86vw" width="700px">
            <v-card>
                <v-card-title class="headline"> {{ $t("component.thirdpartycookie.dialogTitle") }} </v-card-title>
                <v-card-text>
                    <p v-html="$t('component.thirdpartycookie.explanation')" />
                    <p>
                        English:
                        <a
                            target="_blank"
                            href="https://akohubteam.medium.com/how-to-enable-third-party-cookies-on-your-browsers-f9a8143b8cc5"
                        >
                            How to enable Third-Party Cookies on different browsers
                        </a>
                        <br />Chinese:
                        <a
                            target="_blank"
                            href="https://support.mozilla.org/zh-CN/kb/Firefox%20%E7%9A%84%E8%B7%9F%E8%B8%AA%E4%BF%9D%E6%8A%A4%E5%92%8C%E7%AC%AC%E4%B8%89%E6%96%B9%20Cookie?redirectslug=%E7%A6%81%E7%94%A8%E7%AC%AC%E4%B8%89%E6%96%B9+Cookie+%E9%98%BB%E6%AD%A2%E6%9F%90%E4%BA%9B%E7%B1%BB%E5%9E%8B%E7%9A%84%E5%B9%BF%E5%91%8A%E5%95%86%E8%B7%9F%E8%B8%AA&redirectlocale=zh-CN"
                        >
                            Firefox 的跟踪保护和第三方 Cookie
                        </a>
                        <br />Japanese:
                        <a
                            target="_blank"
                            href="https://help.talend.com/r/shQsvBn3CEOBmBTtOP7vcg/qDx2O9S7Pz~W5_x~IO1Sgw"
                        >
                            ブラウザーでのサードパーティCookieの許可
                        </a>
                    </p>
                    <v-img
                        width="400px"
                        src="https://blog.mozilla.org/wp-content/uploads/2019/08/ETP-Blocking-Cookies-300x264.png"
                    ></v-img>
                </v-card-text>
                <v-card-actions>
                    <v-btn outlined color="warning" @click="dialogOpen = false">
                        {{ $t("views.app.close_btn") }}
                    </v-btn>
                    <v-btn
                        outlined
                        color="error"
                        @click="
                            $store.commit('setTPCookieAlertDismissed', true);
                            dialogOpen = false;
                        "
                    >
                        {{ $t("component.thirdpartycookie.neverShowAgain") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <div v-if="shouldTestTPCookie && !tpCookieTested" style="display: none">
            <!-- only if should test -->
            <iframe src="https://ricecakess.github.io/Holodex/3pcookie2.html" />
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    data() {
        return {
            tpCookieTested: false,
            dialogOpen: false,
        };
    },
    computed: {
        ...mapState(["TPCookieEnabled", "TPCookieAlertDismissed"]),
        shouldTestTPCookie() {
            return (
                (!this.TPCookieEnabled || this.TPCookieEnabled < Date.now() - 24 * 7 * 60 * 60 * 1000) &&
                /* every week, check */ !this.TPCookieAlertDismissed
            );
        },
    },
    created() {
        if (this.shouldTestTPCookie) {
            const self = this;
            const receiveMessage = function (evt) {
                if (evt.data === "MM:3PCunsupported") {
                    // document.getElementById("result").innerHTML = "not supported";
                    window.removeEventListener("message", receiveMessage);
                    self.$store.commit("setTPCookieEnabled", false);
                    self.tpCookieTested = true;
                } else if (evt.data === "MM:3PCsupported") {
                    // document.getElementById("result").innerHTML = "supported";
                    window.removeEventListener("message", receiveMessage);
                    self.$store.commit("setTPCookieEnabled", Date.now());
                    self.tpCookieTested = true;
                }
            };
            window.addEventListener("message", receiveMessage, false);
        }
    },
};
</script>

<style></style>
