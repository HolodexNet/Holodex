<template>
  <v-container fluid style="height: 100%">
    <v-card class="ma-auto mt-6" elevation="12" max-width="500px">
      <user-card v-if="userdata.user" />
      <v-divider />
      <v-card-subtitle class="justify-center">
        {{
          userdata.user
            ? $t("views.login.linkAcc")
            : $t("component.mainNav.login")
        }}
      </v-card-subtitle>
      <v-card-text class="d-flex flex-column align-center">
        <div class="d-flex flex-column" style="max-width: 400px; width: 100%">
          <google-sign-in-button
            v-if="!userdata.user || !userdata.user.discord_id"
            @onCredentialResponse="loginGoogle"
          />
          <v-btn
            v-if="!userdata.user || !userdata.user.discord_id"
            class="my-3 pl-2"
            color="indigo"
            @click="loginDiscord"
          >
            <v-icon class="mr-auto">
              {{ icons.mdiDiscord }}
            </v-icon>

            <span class="mr-auto">{{ $t("views.login.with.1") }}</span>
          </v-btn>
          <v-btn
            v-if="!userdata.user || !userdata.user.twitter_id"
            class="my-3 pl-2"
            color="blue lighten-1"
            @click="loginTwitter"
          >
            <v-icon class="mr-auto">
              {{ icons.mdiTwitter }}
            </v-icon>

            <span class="mr-auto">{{ $t("views.login.with.2") }}</span>
          </v-btn>
        </div>
      </v-card-text>
      <v-divider />

      <template v-if="userdata.user">
        <v-card-text>
          <span class="text-subtitle-2 mb-1 d-inline-block">{{
            $t("views.login.username")
          }}</span>
          <div class="d-flex flex-row align-center">
            <v-text-field
              v-model="usernameInput"
              :disabled="!editingUsername"
              :filled="!editingUsername"
              rounded
              outlined
              dense
              hide-details
            />
            <v-btn
              :color="editingUsername ? 'success' : 'primary'"
              style="margin-left: 10px"
              @click="editUsername"
            >
              {{
                editingUsername
                  ? $t("views.login.usernameBtn.2")
                  : $t("views.login.usernameBtn.0")
              }}
            </v-btn>
          </div>
        </v-card-text>
        <v-divider />

        <v-card-text v-if="userdata.user.yt_channel_key">
          <span class="text-subtitle-2 mb-1 d-inline-block">{{
            $t("views.login.ownedYtChannel")
          }}</span>
          <v-text-field
            readonly
            rounded
            filled
            dense
            hide-details
            :value="userdata.user.yt_channel_key || 'None on file'"
          />
          <span class="text-caption">
            {{ $t("views.login.futureYtcOwnerMessage") }}
          </span>
        </v-card-text>
        <v-card-text>
          <span class="text-subtitle-2 mb-1 d-inline-block">API Key</span>
          <v-text-field
            readonly
            rounded
            outlined
            dense
            hide-details
            :class="doneCopy ? 'green lighten-2' : ''"
            :value="userdata.user.api_key || 'None on file'"
            :append-icon="icons.mdiClipboardPlusOutline"
            @click:append="copyToClipboard(userdata.user.api_key)"
          />
          <br>
          <v-btn
            small
            block
            color="warning"
            @click="resetKey"
          >
            {{ $t("views.login.apikeyNew") }}
          </v-btn>
          <span class="text-caption">
            {{ $t("views.login.apikeyMsg") }}
          </span>
          <v-btn
            small
            block
            color="info"
            href="https://holodex.stoplight.io/"
            target="_blank"
          >
            API Documentation
            <v-icon small right>
              {{ icons.mdiOpenInNew }}
            </v-icon>
          </v-btn>
        </v-card-text>
        <v-divider />
        <v-card-text id="calendar">
          iCal Feed for tracking streams on your Apple Calendar
          <calendar-usage
            :initial-query="initialQueryForCalendar"
          />
        </v-card-text>
        <div class="py-3" />
      </template>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import open from "oauth-open";
import api from "@/utils/backend-api";
import UserCard from "@/components/user/UserCard.vue";
import copyToClipboard from "@/mixins/copyToClipboard";
import GoogleSignInButton from "@/components/common/GoogleSignInButton.vue";
import CalendarUsage from "@/components/calendar/CalendarUsage.vue";

const apiURI = "/api";
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
    components: { UserCard, GoogleSignInButton, CalendarUsage },
    mixins: [copyToClipboard],
    data() {
        return {
            editingUsername: false,
            editUsernameInput: "",
            initialQueryForCalendar: false,
        };
    },
    computed: {
        userdata() {
            return this.$store.state.userdata;
        },
        usernameInput: {
            get() {
                return this.editingUsername
                    ? this.editUsernameInput
                    : this.userdata?.user?.username;
            },
            set(val) {
                this.editUsernameInput = val;
            },
        },
    },
    async created() {
        if (this.$store.state.currentOrg.name !== "All Vtubers") {
            this.initialQueryForCalendar = [
                {
                    type: "org",
                    text: this.$store.state.currentOrg.name,
                    value: this.$store.state.currentOrg.name,
                },
            ];
        } else {
            this.initialQueryForCalendar = false;
        }
    },
    async mounted() {
        const params = new URL(window.location.href).searchParams;
        const service = params.get("service");
        const jwt = params.get("jwt");
        if (service === "twitter" && jwt) {
            const twitterTempJWT = jwt;
            const resp = await api.login(
                this.$store.state.userdata.jwt,
                twitterTempJWT,
                "twitter",
            );
            this.$store.commit("setUser", resp.data);
            this.$gtag.event("login", {
                event_label: "twitter",
            });
            this.$store.dispatch("favorites/resetFavorites");
        }
        if (this.$route.hash) setTimeout(() => this.scrollFix(this.$route.hash), 1);
    },
    methods: {
        scrollFix(hashbang) {
            window.location.hash = hashbang;
        },
        async loginGoogle({ credential }) {
            const resp = await api.login(
                this.$store.state.userdata.jwt,
                credential,
                "google",
            );
            this.$store.commit("setUser", resp.data);
            this.$gtag.event("login", {
                event_label: "google",
            });

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
                    const resp = await api.login(
                        this.$store.state.userdata.jwt,
                        out.access_token,
                        "discord",
                    );
                    // console.log(resp);
                    this.$store.commit("setUser", resp.data);
                    this.$gtag.event("login", {
                        event_label: "discord",
                    });

                    this.$store.dispatch("favorites/resetFavorites");
                },
            );
        },
        async loginTwitter() {
            window.location.href = `${apiURI}/v2/user/login/twitter`;
        },
        async forceUserUpdate() {
            this.$store.dispatch("loginVerify");
        },
        async resetKey() {
            /* eslint-disable no-restricted-globals, no-alert */
            if (this.userdata.user.api_key) {
                const confirm1 = confirm(this.$t("views.login.apikeyResetConfirm1"));
                if (!confirm1) {
                    alert(this.$t("views.login.apikeyResetNvm"));
                    return;
                }
                const confirm2 = confirm(this.$t("views.login.apikeyResetConfirm2"));
                if (!confirm2) {
                    alert(this.$t("views.login.apikeyResetNvm"));
                    return;
                }
            }
            await api.resetAPIKey(this.userdata.jwt);
            this.forceUserUpdate();
            /* eslint-enable no-restricted-globals, no-alert */
        },
        async editUsername() {
            if (this.editingUsername) {
                this.editingUsername = false;
                try {
                    const res = await api.changeUsername(
                        this.userdata.jwt,
                        this.editUsernameInput,
                    );
                    if (res && res.status === 200) {
                        this.forceUserUpdate();
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                if (!this.userdata?.user?.username) return;
                this.editUsernameInput = this.userdata.user.username;
                this.editingUsername = true;
            }
        },
    },
};
</script>
<style>
#calendar:target {
  border: 1px solid #ff000088;
}
</style>
