<template>
  <v-container fluid style="height: 100%">
    <v-card class="m-auto mt-6" elevation="12" max-width="500px">
      <user-card v-if="site.user" />
      <v-divider />
      <v-card-subtitle class="justify-center">
        {{
          site.user ? $t("views.login.linkAcc") : $t("component.mainNav.login")
        }}
      </v-card-subtitle>
      <v-card-text class="flex flex-col items-center">
        <div class="flex flex-col" style="max-width: 400px; width: 100%">
          <google-sign-in-button
            v-if="!site.user || !site.user.google_id"
            class="my-1"
            @on-credential-response="onGoogleSuccess"
          />
          <v-btn
            v-if="!site.user || !site.user.discord_id"
            class="my-1"
            color="indigo"
            @click="loginDiscord"
          >
            <v-icon>
              {{ icons.mdiDiscord }}
            </v-icon>

            <span>{{ $t("views.login.with.1") }}</span>
          </v-btn>
          <v-btn
            v-if="!site.user || !site.user.twitter_id"
            class="my-1"
            color="blue lighten-1"
            @click="loginTwitter"
          >
            <v-icon>
              {{ icons.mdiTwitter }}
            </v-icon>

            <span>{{ $t("views.login.with.2") }}</span>
          </v-btn>
        </div>
      </v-card-text>
      <v-divider />

      <template v-if="site.user">
        <v-card-text>
          <span class="text-subtitle-2 mb-1 inline-block">{{
            $t("views.login.username")
          }}</span>
          <div class="flex items-center">
            <v-text-field
              v-model="editUsernameInput"
              :disabled="!editingUsername"
              :filled="!editingUsername"
              rounded
              variant="outlined"
              density="comfortable"
              hide-details="auto"
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

        <v-card-text>
          <span class="text-subtitle-2 mb-1 inline-block">{{
            $t("views.login.ownedYtChannel")
          }}</span>
          <v-text-field
            readonly
            rounded
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            :value="site.user.yt_channel_key"
            placeholder="None on file"
          />
          <span class="text-caption">
            {{ $t("views.login.futureYtcOwnerMessage") }}
          </span>
          <br />
          <br />
          <span class="text-subtitle-2 mb-1 inline-block">API Key</span>
          <v-text-field
            v-model="site.user.api_key"
            readonly
            rounded
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            placeholder="None on file"
            :append-icon="icons.mdiClipboardPlusOutline"
            @click:append="copyToClipboard(site.user?.api_key || '')"
          />
          <br />
          <v-btn small block color="warning" @click="resetKey">
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
      </template>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import open from "oauth-open";
import GoogleSignInButton from "@/components/login/GoogleSignInButton.vue";
import { useSiteStore } from "@/stores";
import { useClientLogin } from "@/hooks/auth/login";
import { useClipboardWithToast } from "@/hooks/common/useCopyToClipboard";
import { useClient } from "@/hooks/auth/client";
import { useI18n } from "vue-i18n";
const apiURI = "/api";
// the fact this URI is invalid doesn't matter,
// all it matters is we own the domain so oauth-open can grab the URI from the window

const site = useSiteStore();
const { onDiscordSuccess, onGoogleSuccess, onTwitterSuccess } =
  useClientLogin();
const copyToClipboard = useClipboardWithToast();
const editingUsername = ref(false);
const editUsernameInput = ref(site.user?.username);
watch(
  () => site.user,
  () => {
    editUsernameInput.value = site.user?.username;
  }
);
const { t } = useI18n();

onMounted(async () => {
  const params = new URL(window.location.href).searchParams;
  const service = params.get("service");
  const jwt = params.get("jwt");
  if (service === "twitter" && jwt) {
    const twitterTempJWT = jwt;
    onTwitterSuccess(undefined, { jwt: twitterTempJWT });
  }
});

async function loginDiscord() {
  // // redirect location:
  const redirectUri = `${window.location.protocol}//${window.location.host}/discord`;
  // out:
  // {token_type: "Bearer", access_token: "<SOMEACCESSTOKEN>", expires_in: "604800", scope: "identify"}
  open(
    `https://discord.com/api/oauth2/authorize?client_id=793619250115379262&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=identify`,
    onDiscordSuccess
  );
}

function loginTwitter() {
  window.location.href = `${apiURI}/v2/user/login/twitter`;
}

async function resetKey() {
  // /* eslint-disable no-restricted-globals, no-alert */
  if (site.user?.api_key) {
    const confirm1 = confirm(t("views.login.apikeyResetConfirm1"));
    if (!confirm1) {
      alert(t("views.login.apikeyResetNvm"));
      return;
    }
    const confirm2 = confirm(t("views.login.apikeyResetConfirm2"));
    if (!confirm2) {
      alert(t("views.login.apikeyResetNvm"));
      return;
    }
  }
  try {
    await AxiosInstance("/user/createKey");
    await checkAndRefreshUser();
  } catch (e) {
    alert("something went wrong creating your key...");
  }
  // /* eslint-enable no-restricted-globals, no-alert */
}

const { AxiosInstance, checkAndRefreshUser } = useClient();
async function editUsername() {
  if (editingUsername.value) {
    editingUsername.value = false;
    const name = editUsernameInput.value;
    try {
      const res = await AxiosInstance("/user", {
        method: "post",
        data: { name },
      });
      if (res && res.status === 200) {
        await checkAndRefreshUser();
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    if (!site?.user?.username) return;
    editUsernameInput.value = site.user.username;
    editingUsername.value = true;
  }
}
</script>
