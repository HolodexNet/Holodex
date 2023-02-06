<template>
  <!-- <v-container fluid style="height: 100%"> -->
  <div
    class="max-w-lg bg-bgColor"
    :class="{
      'card m-auto mt-6 max-w-md shadow-lg': $route.name !== 'Settings_User',
    }"
  >
    <user-card v-if="site.user" class="p-0" />
    <div class="card-body p-0">
      <div class="flex flex-col items-center">
        <div
          v-if="
            !site.user?.google_id ||
            !site.user?.twitter_id ||
            !site.user?.twitter_id
          "
          class="flex justify-center py-2 text-lg font-bold"
          :class="{ 'self-start': site.user }"
        >
          {{
            site.user
              ? $t("views.login.linkAcc")
              : $t("component.mainNav.login")
          }}
        </div>
        <div class="flex flex-col" style="max-width: 400px; width: 100%">
          <google-sign-in-button
            v-if="!site.user || !site.user.google_id"
            class="my-1 h-8"
            @on-credential-response="onGoogleSuccess"
          />
          <button
            v-if="!site.user || !site.user.discord_id"
            class="btn btn-sm my-1 h-8 normal-case"
            color="indigo"
            @click="loginDiscord"
          >
            <div :class="icons.discord" class="left-2 mr-auto"></div>

            <span class="mr-auto">{{ $t("views.login.with.1") }}</span>
          </button>
          <button
            v-if="!site.user || !site.user.twitter_id"
            class="btn btn-sm my-1 h-8 normal-case"
            color="blue lighten-1"
            @click="loginTwitter"
          >
            <div :class="icons.twitter" class="left-2 mr-auto"></div>

            <span class="mr-auto">{{ $t("views.login.with.2") }}</span>
          </button>
        </div>
      </div>

      <template v-if="site.user">
        <!-- <div class="card-body"> -->
        <div class="divider"></div>

        <span class="text-subtitle-2 inline-block">{{
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
          <h-btn
            :color="editingUsername ? 'success' : 'primary'"
            style="margin-left: 10px"
            @click="editUsername"
          >
            {{
              editingUsername
                ? $t("views.login.usernameBtn.2")
                : $t("views.login.usernameBtn.0")
            }}
          </h-btn>
        </div>
        <!-- </div> -->

        <!-- <div class="card-body"> -->
        <div class="mt-2 text-gray-500">
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
          <span class="text-sm">
            {{ $t("views.login.futureYtcOwnerMessage") }}
          </span>
        </div>
        <div class="divider"></div>

        <span class="text-subtitle-2 mb-1 inline-block">API Key</span>
        <v-text-field
          v-model="site.user.api_key"
          readonly
          rounded
          variant="outlined"
          density="comfortable"
          hide-details="auto"
          placeholder="None on file"
          :append-inner-icon="icons.mdiClipboardPlusOutline"
          @click:append-inner="copyToClipboard(site.user?.api_key || '')"
        />
        <h-btn small block color="warning" @click="resetKey">
          {{ $t("views.login.apikeyNew") }}
        </h-btn>
        <span class="text-caption">
          {{ $t("views.login.apikeyMsg") }}
        </span>
        <h-btn
          small
          block
          color="info"
          href="https://holodex.stoplight.io/"
          target="_blank"
        >
          API Documentation
          <h-icon small right>
            {{ icons.mdiOpenInNew }}
          </h-icon>
        </h-btn>
        <!-- </div> -->
      </template>
    </div>
  </div>
  <!-- </v-container> -->
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
