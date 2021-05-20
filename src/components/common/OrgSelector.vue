<template>
    <span>
        <v-menu bottom offset-y>
            <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on" class="d-inline nav-title" style="position: relative">
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
                    <v-tooltip v-model="firstVisit" right bottom z-index="120" content-class="first-visit-tooltip">
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
                <v-list-item
                    v-for="org in orgFavorites"
                    :key="org"
                    @click="currentOrg = org"
                    :input-value="currentOrg === org"
                >
                    <v-list-item-title>{{ org }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="showOrgDialog = true">
                    <v-list-item-title class="primary--text">Show More</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-dialog v-model="showOrgDialog" max-width="1000px">
            <v-card min-height="50vh">
                <v-card-title>Add/Edit Org</v-card-title>
                <v-card-text>
                    <v-text-field label="Search" v-model="search" class="px-4"></v-text-field>
                    <v-list>
                        <v-list-item
                            v-for="org in sortedOrgs"
                            :key="org"
                            dense
                            @click="currentOrg = org"
                            :ripple="false"
                        >
                            <v-list-item-action height="32px">
                                <v-btn
                                    icon
                                    @click.stop="toggleFavoriteOrg(org)"
                                    :color="orgFavorites.includes(org) ? 'yellow' : 'grey'"
                                >
                                    <v-icon>{{ icons.mdiStar }}</v-icon>
                                </v-btn>
                            </v-list-item-action>
                            <v-list-item-content @click="currentOrg = org">{{ org }}</v-list-item-content>

                            <v-list-item-action
                                style="flex-direction: row !important"
                                v-if="orgFavorites.includes(org)"
                                @click.stop.prevent
                            >
                                <v-btn @click.stop="shiftOrgFavorites({ org, up: true })" icon :ripple="false">
                                    <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                                </v-btn>
                                <v-btn @click.stop="shiftOrgFavorites({ org, up: false })" icon :ripple="false">
                                    <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                                </v-btn>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    </span>
</template>

<script>
import { ORGS, ORGS_PREFIX } from "@/utils/consts";
import { mapMutations } from "vuex";

export default {
    name: "OrgSelector",
    data() {
        return {
            ORGS,
            ORGS_PREFIX,
            showOrgDialog: false,
            search: "",
        };
    },
    watch: {
        search() {},
    },
    computed: {
        firstVisit: {
            get() {
                return this.$store.state.firstVisit;
            },
            set() {
                return this.$store.commit("setVisited");
            },
        },
        sortedOrgs() {
            let list = this.ORGS.slice();
            if (this.search) {
                list = list.filter((x) => x.toLowerCase().includes(this.search.toLowerCase()));
            }
            list.sort((a, b) => {
                const index1 = this.orgFavorites.indexOf(a);
                const index2 = this.orgFavorites.indexOf(b);
                if (index1 < 0 && index2 < 0) return 0;
                if (index1 < 0 && index2 >= 0) return 1;
                if (index2 < 0 && index1 >= 0) return -1;

                return index1 - index2;
            });
            return list;
        },
        currentOrg: {
            get() {
                return this.$store.state.currentOrg;
            },
            set(val) {
                if (this.$route.name === "favorites") this.$router.push({ name: "home" });
                return this.$store.commit("setCurrentOrg", val);
            },
        },
        orgFavorites() {
            return this.$store.state.orgFavorites;
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
    },
    methods: {
        ...mapMutations(["toggleFavoriteOrg", "shiftOrgFavorites"]),
        shiftUp(org) {
            const favIndex = this.orgFavorites.indexOf(org);
            const temp = this.orgFavorites[favIndex - 1];
            this.orgFavorites.splice(favIndex - 1, 1, org);
            this.orgFavorites.splice(favIndex, 1, temp);
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
