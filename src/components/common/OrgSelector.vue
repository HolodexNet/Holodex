<template>
    <span>
        <v-menu bottom offset-y>
            <template v-slot:activator="{ on, attrs }">
                <div
                    v-bind="attrs"
                    v-on="on"
                    class="d-inline nav-title"
                    :class="isMobile ? 'nav-title-slim' : ''"
                    style="position: relative"
                >
                    <v-fade-transition mode="out-in">
                        <span
                            :key="currentOrg"
                            style="text-decoration: underline"
                            :class="{
                                'grey--text text--darken-4': !darkMode,
                                'grey-text text--lighten-2': darkMode,
                            }"
                            >{{ ORGS_PREFIX[currentOrg] || currentOrg }}</span
                        >
                    </v-fade-transition>
                    <span
                        class="primary--text"
                        :class="{ 'text--lighten-2': darkMode, 'text--darken-4': !darkMode }"
                        ref="dexBtn"
                        >dex</span
                    >
                    <v-tooltip
                        v-model="firstVisitComputed"
                        right
                        bottom
                        z-index="120"
                        content-class="first-visit-tooltip"
                    >
                        <template v-slot:activator="{}">
                            <v-icon
                                size="30"
                                class="change-org-icon"
                                :class="{ 'rotate-180': attrs['aria-expanded'] === 'true' }"
                                v-on="on"
                            >
                                {{ icons.mdiMenuDown }}
                            </v-icon>
                        </template>
                        <div>{{ $t("views.app.nowSupportsMultiOrg") }}</div>
                        <div>{{ $t("views.app.loginCallToAction") }}</div>
                    </v-tooltip>
                </div>
            </template>

            <v-list style="max-height: 300px; overscroll-behavior: contain" class="overflow-y-auto">
                <v-list-item v-for="org in ORGS" :key="org" @click="currentOrg = org" :input-value="currentOrg === org">
                    <v-list-item-title>{{ org }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog> </v-dialog>
    </span>
</template>

<script>
import { ORGS, ORGS_PREFIX } from "@/utils/consts";

export default {
    name: "OrgSelector",
    data() {
        return {
            ORGS,
            ORGS_PREFIX,
        };
    },
    computed: {
        currentOrg: {
            get() {
                return this.$store.state.currentOrg;
            },
            set(val) {
                if (this.$route.name === "favorites") this.$router.push({ name: "home" });
                return this.$store.commit("setCurrentOrg", val);
            },
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
    },
};
</script>

<style>
.nav-title {
    text-decoration: none;
    font-size: 24px;
    line-height: 1.2px;
}

.rotate-180 {
    transform: rotate(180deg);
}
</style>
