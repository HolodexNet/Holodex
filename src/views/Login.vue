<template>
    <v-container fluid style="height: 100%">
        <button @click.prevent="loginGoogle">Login with Google</button><br />
        <button @click.prevent="loginDiscord">Login with Discord</button><br />
        <button @click.prevent="loginTwitter">Login with Twitter</button>
    </v-container>
</template>

<script>
import GAuth from "vue-google-oauth2";
import open from "oauth-open";
import api from "@/utils/backend-api";
import dayjs from "dayjs";
// import { mdiHeart } from "@mdi/js";
import utc from "dayjs/plugin/utc";
import Vue from "vue";

dayjs.extend(utc);

const gauthOption = {
    clientId: "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/userinfo.email",
    // scope: "openid",
    prompt: "select_account",
    fetch_basic_profile: false,
};
Vue.use(GAuth, gauthOption);

const redirectUri =
    process.env.NODE_ENV === "development" ? "http://localhost:8080/discord" : "https://holodex.net/discord";
// the fact this URI is invalid doesn't matter,
// all it matters is we own the domain so oauth-open can grab the URI from the window

export default {
    name: "Login",
    metaInfo: {
        title: "Login",
    },
    components: {},
    data() {
        return {};
    },
    mounted() {},
    computed: {},
    methods: {
        async loginGoogle() {
            const authCode = await this.$gAuth.getAuthCode();
            const resp = await api.login(authCode, "google");
            console.log(resp);
        },
        async loginDiscord() {
            // out:
            // {token_type: "Bearer", access_token: "<SOMEACCESSTOKEN>", expires_in: "604800", scope: "identify"}
            open(
                `https://discord.com/api/oauth2/authorize?client_id=793619250115379262&redirect_uri=${encodeURIComponent(
                    redirectUri,
                )}&response_type=token&scope=identify`,
                async (err, out) => {
                    const resp = await api.login(out.access_token, "discord");
                    console.log(resp);
                },
            );
        },
        async loginTwitter() {
            open("http://localhost:2434/v2/user/login/twitter", async (err, out) => {
                const twitterTempJWT = out.jwt;
                const resp = await api.login(twitterTempJWT, "twitter");
                console.log(resp);
            });
        },
    },
};
</script>
