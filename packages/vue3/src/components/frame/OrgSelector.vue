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
            class="nav-title flex cursor-pointer flex-row items-center"
            style="position: relative"
          >
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 "
              enter-to-class="transform opacity-100 "
              leave-active-class="transition ease-in duration-50 absolute"
              leave-from-class="transform opacity-100 "
              leave-to-class="transform opacity-0 "
            >
              <span
                :key="currentOrg.name + 'header'"
                style="text-decoration: underline"
                >{{ currentOrg.short || currentOrg.name }}</span
              ></transition
            >
            <span ref="dexBtn" class="text-primary">dex</span>
            <div
              class="change-org-icon i-material-symbols:arrow-drop-down-rounded transform-gpu border-none text-xl transition-transform"
              :class="{
                'rotate-180': activator.props['aria-expanded'] === 'true',
              }"
              style="width: 30px; height: 30px"
            ></div>
          </div>
        </slot>
      </template>
      <ul
        class="menu overflow-y-auto rounded-md border-2 border-secondary bg-bgColor-500 text-base-content"
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
    <div class="card-compact card h-[90vh] bg-base-100">
      <div class="card-body overflow-y-auto px-1" style="">
        <v-text-field
          v-model="search"
          hide-details
          variant="underlined"
          :label="$t('component.search.searchLabel')"
          class="px-1"
          color="accent"
        />
        <ul
          class="menu menu-vertical flex-nowrap content-start overflow-y-auto bg-bgColor"
        >
          <li
            v-for="org in sortedOrgs"
            :key="org.name + '_list_item'"
            class="max-w-xs"
          >
            <!--             :class="orgFavoritesNameSet.has(org.name) ? 'bordered' : ''" -->
            <a
              class="flex flex-row gap-1"
              @click="$emit('changed', org, closeDialog)"
            >
              <h-btn
                class="btn btn-sm btn-square"
                :class="
                  orgFavoritesNameSet.has(org.name)
                    ? 'btn-outline btn-primary'
                    : 'btn-ghost'
                "
                style="padding-top: 0px; padding-bottom: 0px"
                icon="i-material-symbols:star-outline-rounded w-8 h-8"
                @click.stop="site.toggleFavoriteOrg(org)"
              >
              </h-btn>
              <span class="flex flex-grow">{{ org.name }}</span>
              <div
                v-if="orgFavoritesNameSet.has(org.name)"
                class="btn-group self-end"
              >
                <h-btn
                  class="btn btn-ghost btn-sm p-0"
                  style="padding-top: 0px; padding-bottom: 0px"
                  icon="i-bx:chevron-up"
                  @click.stop.prevent="
                    site.shiftOrgFavorites({ org, up: true })
                  "
                >
                </h-btn>
                <h-btn
                  class="btn btn-ghost btn-sm"
                  style="padding-top: 0px; padding-bottom: 0px"
                  icon="i-bx:chevron-down"
                  @click.stop.prevent="
                    site.shiftOrgFavorites({ org, up: false })
                  "
                >
                </h-btn>
              </div>
            </a>
          </li>
        </ul>
      </div>
      <h-divider />
      <v-card-actions>
        <h-btn text class="text-red ml-auto" @click="showOrgDialog = false">{{
          $t("views.app.close_btn")
        }}</h-btn>
      </v-card-actions>
    </div>
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
  line-height: 1.4;
}

/* .change-org-icon:focus::after {
  opacity: 0 !important;
} */

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
