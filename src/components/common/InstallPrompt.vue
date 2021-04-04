<template>
    <div class="pa-2 primary" v-if="showInstallPrompt">
        <div class="d-flex align-center">
            <img
                src="https://holodex.net/img/icons/apple-touch-icon-152x152.png"
                style="height: 40px; width: 40px; border-radius: 6px"
            />
            <div class="ml-2 text-subtitle-2">{{ $t("component.installPrompt.title") }}</div>
        </div>
        <div class="text-caption my-2">{{ $t("component.installPrompt.callToAction") }}</div>
        <div class="d-flex justify-end">
            <v-btn text small style="color: rgba(255, 255, 255, 0.7)" @click="hideInstallPrompt">{{
                $t("component.installPrompt.notNowBtn")
            }}</v-btn>
            <v-btn small color="secondary" @click="install">{{ $t("component.installPrompt.installBtn") }}</v-btn>
        </div>
        <v-dialog max-width="350" v-model="iOSInstallDialog">
            <v-card class="py-4">
                <div style="text-align: center">
                    <div>
                        <img
                            src="https://holodex.net/img/icons/apple-touch-icon-152x152.png"
                            style="height: 75px; width: 75px; border-radius: 6px"
                        />
                    </div>
                    <div class="text-h5">{{ $t("component.installPrompt.iOS.popup") }}</div>
                    <v-divider></v-divider>
                    <div class="mt-3">
                        {{ $t("component.installPrompt.iOS.beforeExportIcon") }}
                        <v-icon color="secondary">{{ mdiExportVariant }}</v-icon>
                        {{ $t("component.installPrompt.iOS.afterExportIcon") }}
                    </div>
                </div>
                <!-- <v-card-actions class="py-0">
                    <v-spacer />
                    <v-btn
                        color="primary"
                        text
                        @click="iOSInstallDialog = false"
                    >
                        Close
                    </v-btn>
                </v-card-actions> -->
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { mdiExportVariant } from "@mdi/js";

export default {
    name: "InstallPrompt",
    data() {
        return {
            deferredPrompt: null,
            iOSInstallDialog: false,
            mdiExportVariant,
        };
    },
    mounted() {
        window.addEventListener("beforeinstallprompt", (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            this.deferredPrompt = e;

            // Optionally, send analytics event that PWA install promo was shown.
            console.log("'beforeinstallprompt' event was fired.");
        });

        window.addEventListener("appinstalled", () => {
            this.deferredPrompt = null;
        });
    },
    computed: {
        showInstallPrompt() {
            const promptWeekly =
                new Date().getTime() - this.$store.state.lastShownInstallPrompt > 1000 * 60 * 60 * 24 * 7;
            if (this.isAppleDevice() && !this.isStandAlone() && promptWeekly) {
                return true;
            }
            if (this.deferredPrompt && promptWeekly) {
                return true;
            }
            return false;
        },
    },
    methods: {
        async install() {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferedPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                this.deferredPrompt = null;
            } else {
                this.iOSInstallDialog = true;
            }
        },
        hideInstallPrompt() {
            this.$store.commit("installPromptShown");
        },
        isAppleDevice() {
            return ["iPhone", "iPad", "iPod"].includes(navigator.platform);
        },
        isStandAlone() {
            type iOSNavigator = Navigator & { standalone: boolean };
            return (navigator as iOSNavigator).standalone || window.matchMedia("(display-mode: standalone)").matches;
        },
    },
};
</script>

<style></style>
