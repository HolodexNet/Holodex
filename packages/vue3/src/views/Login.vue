<template>
  <!-- <v-container fluid style="height: 100%"> -->
  <div class="m-auto mt-6 shadow-lg card bg-bgColor" style="max-width: 500px">
    <user-card v-if="site.user" class="p-2" />
    <div class="pt-0 card-body">
      <div class="flex flex-col items-center">
        <div
          v-if="
            !site.user?.google_id ||
            !site.user?.twitter_id ||
            !site.user?.twitter_id
          "
          class="flex justify-center py-2 text-subtitle-2"
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
            class="h-8 my-1"
            @on-credential-response="onGoogleSuccess"
          />
          <button
            v-if="!site.user || !site.user.discord_id"
            class="h-8 my-1 normal-case btn btn-sm"
            color="indigo"
            @click="loginDiscord"
          >
            <div :class="icons.discord" class="mr-auto left-2"></div>

            <span class="mr-auto">{{ $t("views.login.with.1") }}</span>
          </button>
          <button
            v-if="!site.user || !site.user.twitter_id"
            class="h-8 my-1 normal-case btn btn-sm"
            color="blue lighten-1"
            @click="loginTwitter"
          >
            <div :class="icons.twitter" class="mr-auto left-2"></div>

            <span class="mr-auto">{{ $t("views.login.with.2") }}</span>
          </button>
        </div>
      </div>
      <!-- <v-divider /> -->

      <template v-if="site.user">
        <!-- <div class="card-body"> -->
        <div class="divider"></div>

        <span class="inline-block text-subtitle-2">{{
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
        <!-- </div> -->

        <!-- <div class="card-body"> -->
        <!-- <v-divider /> -->
        <div class="mt-2 text-gray-500">
          <span class="inline-block mb-1 text-subtitle-2">{{
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

        <span class="inline-block mb-1 text-subtitle-2">API Key</span>
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
