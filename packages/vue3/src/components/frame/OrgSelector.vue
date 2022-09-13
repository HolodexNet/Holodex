<template>
  <slot
    name="menu"
    :current-org="currentOrg"
    :show-org-dialog="
      () => {
        showOrgDialog = true;
      }
    "
  >
    <v-menu bottom offset-y>
      <template #activator="activator">
        <slot name="visible" :current-org="currentOrg" :activator="activator">
          <div
            v-bind="activator.props"
            class="inline-block cursor-pointer nav-title"
            style="position: relative"
          >
            <v-fade-transition hide-on-leave>
              <span
                :key="currentOrg.name + 'header'"
                style="text-decoration: underline"
                >{{ currentOrg.short || currentOrg.name }}</span
              >
            </v-fade-transition>
            <span ref="dexBtn" class="text-primary">dex</span>
            <v-icon
              size="30"
              class="transition-transform change-org-icon"
              :class="{
                'rotate-180': activator.props['aria-expanded'] === 'true',
              }"
            >
              {{ icons.mdiMenuDown }}
            </v-icon>
          </div>
        </slot>
      </template>
      <ul
        class="overflow-y-auto border-2 rounded-md menu bg-bgColor-500 text-base-content border-secondary"
      >
        <li
          v-for="org in orgFavorites"
          :key="org.name + 'select'"
          :input-value="org.name === currentOrg.name"
          @click="$emit('changed', org)"
        >
          <span>{{ org.name }}</span>
        </li>
        <li @click="showOrgDialog = true">
          <span
            ><i class="i-material-symbols:layers-rounded"></i
            >{{ $t("views.favorites.showall") }}</span
          >
        </li>
      </ul>
    </v-menu>
  </slot>
  <v-dialog v-model="showOrgDialog">
    <v-card>
      <v-card-text
        class="px-1 overflow-y-auto h-fit"
        style="width: 30vw; min-width: 340px; max-width: 800px"
      >
        <v-text-field
          v-model="search"
          hide-details
          variant="underlined"
          :label="$t('component.search.searchLabel')"
          class="px-1"
          color="accent"
        />
        <ul class="overflow-y-auto menu bg-bgColor">
          <li v-for="org in sortedOrgs" :key="org.name + '_list_item'">
            <!--             :class="orgFavoritesNameSet.has(org.name) ? 'bordered' : ''"
 -->
            <a
              class="flex flex-row gap-1"
              @click="$emit('changed', org, closeDialog)"
            >
              <button
                class="btn btn-sm btn-square"
                :class="
                  orgFavoritesNameSet.has(org.name)
                    ? 'btn-primary btn-outline'
                    : 'btn-ghost'
                "
                @click.stop="site.toggleFavoriteOrg(org)"
              >
                <v-icon>{{ icons.mdiStar }}</v-icon>
              </button>
              <span class="flex flex-grow">{{ org.name }}</span>
              <div
                v-if="orgFavoritesNameSet.has(org.name)"
                class="self-end btn-group"
              >
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  @click.stop.prevent="
                    site.shiftOrgFavorites({ org, up: true })
                  "
                >
                  <v-icon>{{ icons.mdiChevronUp }}</v-icon>
                </button>
                <button
                  class="btn btn-sm btn-square btn-ghost"
                  @click.stop.prevent="
                    site.shiftOrgFavorites({ org, up: false })
                  "
                >
                  <v-icon>{{ icons.mdiChevronDown }}</v-icon>
                </button>
              </div>
            </a>
          </li>
        </ul>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn text color="red" @click="showOrgDialog = false">{{
          $t("views.app.close_btn")
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import useOrgRouteParamSync from "@/hooks/common/useOrgRouteParamSync";
import { useOrgList } from "@/services/static";
import { useSiteStore } from "@/stores";
import { PropType } from "vue";
import { useDisplay } from "vuetify";

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
 *   Regardless, calling showOrgDialog() inside 'menu' slot binding will cause the Favorite Orgs management/selector
 * dialog to pop up.
 *
 * #menu slot: { currentOrg, showOrgDialog () }
 * - using menu slot, replace the menu entirely w/ a selector or something.>
 *
 * #visible slot: { currentOrg, activator = {props, isActive} }
 * - using visible slot to change the menu toggle area - defaults to holodex dropdown>
 *
 * #prepend-dropdown slot: {}
 * - add additional clickables to the dropdown list.
 *
 *---------------------------------------------* */

export default defineComponent({
  name: "OrgSelector",
  props: {
    currentSelection: {
      type: Object as PropType<Org | undefined>,
      required: false,
      default: undefined,
    },
    hideAllVTubers: {
      type: Boolean,
      optional: true,
    },
  },
  emits: ["changed"],
  setup() {
    const site = useSiteStore();
    const display = useDisplay();
    const orgs = useOrgList({ enabled: true });
    const pageOrg = useOrgRouteParamSync();

    const isMobile = display.mobile;

    return { site, display, isMobile, orgs, pageOrg };
  },
  data() {
    return {
      showOrgDialog: false,
      search: "",
    };
  },
  computed: {
    firstVisit: {
      get() {
        return (
          this.site.guide.firstVisit &&
          navigator.userAgent &&
          !navigator.userAgent.includes("Googlebot")
        );
      },
      set() {
        this.site.guide.firstVisit = false;
      },
    },
    sortedOrgs() {
      let list = (this.orgs.data.value || []).slice();
      if (this.search) {
        list = list.filter((x) =>
          x.name.toLowerCase().includes(this.search.toLowerCase())
        );
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
    currentOrg() {
      return this.currentSelection || this.pageOrg;
    },
    orgFavorites() {
      if (this.hideAllVTubers) {
        return this.site.starredOrgs.filter((x) => x.name !== "All Vtubers");
      }
      return this.site.starredOrgs;
    },
    orgFavoritesNameSet() {
      return new Set(this.orgFavorites.map(({ name }) => name));
    },
  },
  watch: {
    showOrgDialog(v) {
      //   if (v) this.$store.dispatch("orgs/fetchOrgs");
    },
  },
  methods: {
    closeDialog() {
      this.showOrgDialog = false;
    },
  },
});
</script>

<style>
.nav-title {
  text-decoration: none;
  font-size: 24px;
  line-height: 1.2px;
}

.change-org-icon:focus::after {
  opacity: 0 !important;
}

.first-visit-tooltip {
  width: 80%;
  max-width: 480px;
  background: rgb(91, 157, 211);
  font-weight: 500;
  box-shadow: 2px 2px 4px black;
}

.first-visit-tooltip:before {
  content: "";
  position: absolute;
  top: -10px;
  left: 105px;
  width: 0;
  border-bottom: 10px solid rgb(91, 157, 211);
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
}
</style>
