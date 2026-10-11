<template>
  <span>
    <slot
      name="menu"
      :currentOrg="currentOrg"
      :showOrgDialog="
        () => {
          showOrgDialog = true;
        }
      "
    >
      <v-menu bottom offset-y>
        <template #activator="activator">
          <slot name="visible" :currentOrg="currentOrg" :activator="activator">
            <div
              v-bind="activator.attrs"
              class="d-inline nav-title"
              style="position: relative"
              v-on="activator.on"
            >
              <v-fade-transition hide-on-leave>
                <span
                  :key="currentOrg.name + 'header'"
                  style="text-decoration: underline"
                  :class="{
                    'grey--text text--darken-4': !darkMode,
                    'grey-text text--lighten-2': darkMode,
                  }"
                >{{ currentOrg.short || currentOrg.name }}</span>
              </v-fade-transition>
              <span
                ref="dexBtn"
                class="primary--text"
                :class="{ 'text--lighten-2': darkMode, 'text--darken-4': !darkMode }"
              >dex</span>
              <v-tooltip
                v-model="showOrgTip"
                right
                bottom
                z-index="120"
                content-class="first-visit-tooltip"
              >
                <template #activator="{}">
                  <v-icon
                    size="30"
                    class="change-org-icon"
                    :class="{ 'rotate-180': activator.attrs['aria-expanded'] === 'true' }"
                    v-on="activator.on"
                  >
                    {{ icons.mdiMenuDown }}
                  </v-icon>
                </template>
                <div>{{ $t("views.app.nowSupportsMultiOrg") }}</div>
                <div>{{ $t("views.app.loginCallToAction") }}</div>
              </v-tooltip>
            </div>
          </slot>
        </template>

        <v-list style="max-height: 300px; overscroll-behavior: contain" class="overflow-y-auto">
          <slot name="prepend-dropdown" />
          <v-list-item
            v-for="org in orgFavorites"
            :key="org.name + 'select'"
            :input-value="org === (currentSelection || currentOrg)"
            @click="currentOrg = org"
          >
            <v-list-item-title>{{ org.name }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="showOrgDialog = true">
            <v-list-item-title class="primary--text">{{ $t("views.favorites.showall") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </slot>
    <v-dialog v-model="showOrgDialog" max-width="1000px">
      <v-card>
        <v-card-title>{{ $t("views.channels.sortOptions.org") }}</v-card-title>

        <v-card-text class="px-1">
          <v-text-field v-model="search" :label="$t('component.search.searchLabel')" class="px-4" />
          <v-list style="overflow-y: auto; height: calc(75vh - 176px)">
            <v-list-item
              v-for="org in sortedOrgs"
              :key="org.name + 'list'"
              dense
              :ripple="false"
              @click="
                () => {
                  currentOrg = org;
                  showOrgDialog = false;
                }
              "
            >
              <v-list-item-action height="32px">
                <v-btn
                  icon
                  :color="orgFavoritesNameSet.has(org.name) ? 'yellow' : 'grey'"
                  @click.stop="toggleFavoriteOrg(org)"
                >
                  <v-icon>{{ icons.mdiStar }}</v-icon>
                </v-btn>
              </v-list-item-action>

              <v-list-item-content>
                {{ org.name }} {{ org.name_jp ? `(${org.name_jp})` : "" }}
              </v-list-item-content>

              <v-list-item-action
                v-if="orgFavoritesNameSet.has(org.name)"
                style="flex-direction: row !important"
                @click.stop.prevent
              >
                <v-btn icon :ripple="false" @click.stop="shiftOrgFavorites({ org, up: true })">
                  <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                </v-btn>
                <v-btn icon :ripple="false" @click.stop="shiftOrgFavorites({ org, up: false })">
                  <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text color="red" @click="showOrgDialog = false">{{ $t("views.app.close_btn") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
// import backendApi from "@/utils/backend-api";
import { mapMutations, mapState } from "vuex";

/**----------------------------------------------
 * *                   Org Selector
 *   Picks an organization from the available org listing.
 *
 *   Contains slots to expand functionality by:
 * adding additonal clickables to the menu via prepend-dropdown slot
 * change the display logic entirely by using 'visible' slot (this control the 'Holodex' on front page)
 * or supplement your own menu system by using 'menu' slot (this controls the whole menu dropdown,
 * should not be used together with 'visible')
 *
 *   Regardless, setting showOrgDialog = true inside 'menu' slot binding will cause the Favorite Orgs management
 * dialog to pop up.
 *---------------------------------------------* */

export default {
    name: "OrgSelector",
    props: {
        currentSelection: {
            type: Object,
            optional: true,
            default: () => ({
                name: "Hololive",
                short: "Holo",
                name_jp: null,
            }),
        },
        hideAllVTubers: {
            type: Boolean,
            optional: true,
        },
    },
    data() {
        return {
            showOrgDialog: false,
            search: "",
        };
    },
    computed: {
        ...mapState("orgs", ["orgs"]),
        firstVisit: {
            get() {
                return this.$store.state.firstVisit && navigator.userAgent && !navigator.userAgent.includes("Googlebot");
            },
            set() {
                return this.$store.commit("setVisited");
            },
        },
        showOrgTip: {
            get() {
                return this.$store.state.showOrgTip && navigator.userAgent && !navigator.userAgent.includes("Googlebot");
            },
            set() {
                return this.$store.commit("setOrgTip");
            },
        },
        sortedOrgs() {
            let list = this.orgs.slice();
            if (this.search) {
                list = list.filter((x) => x.name.toLowerCase().includes(this.search.toLowerCase()));
            }
            list.sort((a, b) => {
                const index1 = this.orgFavorites.findIndex((x) => x.name === a.name);
                const index2 = this.orgFavorites.findIndex((x) => x.name === b.name);
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
                this.$emit("changed", val);
                if (this.$route.name === "favorites") this.$router.push({ name: "home" });
                if (this.$route.query.org) this.$router.replace({ query: { org: val.name } });

                return this.$store.commit("setCurrentOrg", val);
            },
        },
        orgFavorites() {
            if (this.hideAllVTubers) {
                return this.$store.state.orgFavorites.filter((x) => x.name !== "All Vtubers");
            }
            return this.$store.state.orgFavorites;
        },
        orgFavoritesNameSet() {
            return new Set(this.orgFavorites.map(({ name }) => name));
        },
        darkMode() {
            return this.$store.state.settings.darkMode;
        },
    },
    watch: {
        showOrgDialog(v) {
            if (v) this.$store.dispatch("orgs/fetchOrgs");
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

.change-org-icon:focus::after {
    opacity: 0 !important;
}

.first-visit-tooltip {
    width: auto;
    max-width: 480px;
    background: rgb(40, 40, 40);
    font-weight: 500;
    box-shadow: 2px 2px 4px black;
}
.first-visit-tooltip:before {
    content: "";
    position: absolute;
    top: -10px;
    left: 55px;
    width: 0;
    border-bottom: 10px solid rgb(40, 40, 40);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
}
</style>
