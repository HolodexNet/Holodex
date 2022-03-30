<template>
  <!-- <div> -->
  <div ref="divRef" class="mb-3" style="height: 30px; max-width: 420px; width: 100%" />
</template>

<script>
import Vue from "vue";
import LoadScript from "vue-plugin-load-script";

Vue.use(LoadScript);
const googleUrl = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID = "275540829388-87s7f9v2ht3ih51ah0tjkqng8pd8bqo2.apps.googleusercontent.com";
export default {
    name: "GoogleSignInButton",
    data() {
        return {
            ready: false,
        };
    },
    beforeMount() {
        Vue.loadScript(googleUrl)
            .then(() => {
                if (this.$refs.divRef) {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: (e) => this.$emit("onCredentialResponse", e),
                    });
                    window.google.accounts.id.renderButton(this.$refs.divRef, {
                        theme: "outline",
                        size: "medium",
                        text: this.$t("views.login.with.0"),
                        width: this.$refs.divRef.clientWidth,
                        logo_alignment: "left",
                    });
                    // Prompt on the right
                    // window.google.accounts.id.prompt();
                }
            })
            .catch((e) => {
                console.log(e);
            });
    },
    methods: {
        triggerGoogleLogin() {
            console.log(this.$refs.divRef);
            const button = this.$refs.divRef.querySelector(
                "div[role=button]",
            );
            if (button) {
                button.click();
            }
        },
    },
};
</script>

<style>

</style>
