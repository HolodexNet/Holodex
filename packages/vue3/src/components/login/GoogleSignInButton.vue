<template>
  <!-- <div> -->
  <div
    ref="divRef"
    class="bg-transparent overflow-hidden w-100 rounded-md"
    style="height: 32px; max-width: 420px"
  />
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { loadScript } from "vue-plugin-load-script";

const googleUrl = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID =
  "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com";

const divRef = ref<HTMLDivElement | undefined>();

const emit = defineEmits(["onCredentialResponse"]);
const { t } = useI18n();

onBeforeMount(() => {
  loadScript(googleUrl)
    .then(() => {
      if (divRef.value) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (e: string) => emit("onCredentialResponse", e),
        });
        window.google.accounts.id.renderButton(divRef.value, {
          theme: "outline",
          size: "medium",
          text: t("views.login.with.0"),
          width: divRef.value.clientWidth,
          logo_alignment: "left",
        });
        // Prompt on the right
        // window.google.accounts.id.prompt();
      }
    })
    .catch((e) => {
      console.log(e);
    });
});
</script>

<style></style>
