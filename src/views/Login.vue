<template>
    <v-container fluid style="height: 100%">
        <v-card class="ma-auto mt-6" elevation="12" max-width="500px">
            <user-card v-if="userdata.user"></user-card>
            <v-divider></v-divider>
            <v-card-subtitle class="justify-center">{{
                userdata.user ? "Link another account" : "Login"
            }}</v-card-subtitle>
            <v-card-text class="d-flex flex-column">
                <v-btn
                    class="my-3"
                    v-if="!userdata.user || !userdata.user.google_id"
                    @click.prevent="loginGoogle"
                    color="red accent-2"
                >
                    <v-icon left>{{ icons.mdiGoogle }}</v-icon>
                    Login with Google
                </v-btn>
                <v-btn
                    class="my-3"
                    v-if="!userdata.user || !userdata.user.discord_id"
                    @click.prevent="loginDiscord"
                    color="indigo"
                >
                    <v-icon left>{{ icons.mdiDiscord }}</v-icon>

                    Login with Discord
                </v-btn>
                <v-btn
                    class="my-3"
                    v-if="!userdata.user || !userdata.user.twitter_id"
                    @click.prevent="loginTwitter"
                    color="cyan darken-2"
                >
                    <v-icon left>{{ icons.mdiTwitter }}</v-icon>

                    Login with Twitter
                </v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import GAuth from "vue-google-oauth2";
import open from "oauth-open";
import api from "@/utils/backend-api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Vue from "vue";
import UserCard from "@/components/user/UserCard";
import * as icons from "@/utils/icons";

dayjs.extend(utc);

const gauthOption = {
    clientId: "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/userinfo.email",
    // scope: "openid",
    prompt: "select_account",
    fetch_basic_profile: false,
};
Vue.use(GAuth, gauthOption);

const apiURI = process.env.NODE_ENV === "development" ? "http://localhost:2434" : "/api";
// the fact this URI is invalid doesn't matter,
// all it matters is we own the domain so oauth-open can grab the URI from the window

export default {
    name: "Login",
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.login")} - Holodex`;
            },
        };
    },
    components: { UserCard },
    data() {
        return { icons };
    },
    mounted() {},
    computed: {
        userdata() {
            return this.$store.state.userdata;
        },
    },
    methods: {
        async loginGoogle() {
            const authCode = await this.$gAuth.getAuthCode();
            const resp = await api.login(this.$store.state.userdata.jwt, authCode, "google");
            console.log(resp);
            this.$store.commit("setUser", resp.data);
            this.$store.dispatch("favorites/resetFavorites");
        },
        async loginDiscord() {
            // redirect location:
            const redirectUri = `${window.location.protocol}//${window.location.host}/discord`;

            // out:
            // {token_type: "Bearer", access_token: "<SOMEACCESSTOKEN>", expires_in: "604800", scope: "identify"}
            open(
                `https://discord.com/api/oauth2/authorize?client_id=793619250115379262&redirect_uri=${encodeURIComponent(
                    redirectUri,
                )}&response_type=token&scope=identify`,
                async (err, out) => {
                    const resp = await api.login(this.$store.state.userdata.jwt, out.access_token, "discord");
                    console.log(resp);
                    this.$store.commit("setUser", resp.data);
                    this.$store.dispatch("favorites/resetFavorites");
                },
            );
        },
        async loginTwitter() {
            open(`${apiURI}/v2/user/login/twitter`, async (err, out) => {
                const twitterTempJWT = out.jwt;
                const resp = await api.login(this.$store.state.userdata.jwt, twitterTempJWT, "twitter");
                console.log(resp);
                this.$store.commit("setUser", resp.data);
                this.$store.dispatch("favorites/resetFavorites");
            });
        },
    },
};
</script>
