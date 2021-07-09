<template>
    <v-toolbar class="mv-toolbar" style="right: 0" height="64">
        <v-app-bar-nav-icon @click="toggleMainNav"></v-app-bar-nav-icon>
        <!-- Toolbar Live Video Selector -->
        <div
            class="justify-start d-flex mv-toolbar-btn align-center thin-scroll-bar"
            style="overflow-x: auto; overflow-y: hidden"
        >
            <slot name="left" />
        </div>
        <!-- Right side buttons -->
        <div
            class="flex-grow-1 justify-end d-flex mv-toolbar-btn align-center"
            :class="{ 'no-btn-text': $store.state.isMobile || true }"
        >
            <!-- Show toolbar btns that are not collapsible or not in collapsed state -->
            <template
                v-for="(b, index) in buttons.filter((btn) => !btn.collapse || (!collapseButtons && btn.collapse))"
            >
                <!-- Create btn with tooltip -->
                <v-tooltip bottom :key="`mv-btn-${index}`" v-if="b.tooltip" :color="b.color">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            @click="b.onClick"
                            :color="b.color"
                            icon
                            v-bind="attrs"
                            v-on="on"
                            :class="{ 'mx-1': $vuetify.breakpoint.lgAndUp }"
                        >
                            <v-icon>{{ b.icon }}</v-icon>
                        </v-btn>
                    </template>
                    <span>{{ b.tooltip }}</span>
                </v-tooltip>
                <!-- Create normal button with no tooltip -->
                <v-btn
                    @click="b.onClick"
                    :color="b.color"
                    icon
                    :key="`mv-btn-${index}`"
                    :class="{ 'mx-1': $vuetify.breakpoint.lgAndUp }"
                    v-else
                >
                    <v-icon>{{ b.icon }}</v-icon>
                </v-btn>
            </template>
            <!-- Share button and dialog -->
            <v-menu
                :open-on-click="true"
                bottom
                nudge-bottom="40px"
                :close-on-content-click="false"
                :open-on-hover="false"
                v-model="shareDialog"
                width="400"
                z-index="300"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon>
                        <v-icon>{{ mdiLinkVariant }}</v-icon>
                    </v-btn>
                </template>
                <v-card rounded="lg">
                    <v-card-text class="d-flex">
                        <v-text-field
                            readonly
                            solo-inverted
                            dense
                            hide-details
                            :class="doneCopy ? 'green lighten-2' : ''"
                            :value="exportURL"
                            :append-icon="mdiClipboardPlusOutline"
                            @click:append.stop="startCopyToClipboard(exportURL)"
                        ></v-text-field>
                    </v-card-text>
                </v-card>
            </v-menu>
            <!-- Show vertical dots menu for collapsible buttons -->
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" icon v-show="collapseButtons">
                        <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list dense>
                    <template v-for="(b, index) in buttons.filter((btn) => btn.collapse)">
                        <v-list-item @click="b.onClick" block class="mb-2" :key="`mv-collapsed-${index}`">
                            <v-icon left>{{ b.icon }}</v-icon>
                            <span>{{ b.tooltip }}</span>
                        </v-list-item>
                    </template>
                </v-list>
            </v-menu>
            <v-btn icon @click="collapseToolbar = true">
                <v-icon>{{ icons.mdiChevronUp }}</v-icon>
            </v-btn>
        </div>
    </v-toolbar>
</template>

<script>
import copyToClipboard from "@/mixins/copyToClipboard";
import { mdiLinkVariant, mdiClipboardPlusOutline } from "@mdi/js";
import { encodeLayout } from "@/utils/mv-layout";
import { mapState } from "vuex";

export default {
    name: "MultiviewToolbar",
    mixins: [copyToClipboard],
    props: {
        buttons: Array,
        input: Boolean,
    },
    data() {
        return {
            mdiClipboardPlusOutline,
            mdiLinkVariant,
            shareDialog: false,
        };
    },
    computed: {
        ...mapState("multiview", ["layout", "layoutContent", "presetLayout"]),
        collapseButtons() {
            return this.$vuetify.breakpoint.smAndDown;
        },
        exportURL() {
            if (!this.shareDialog) return "";
            const layoutParam = `/${encodeURIComponent(
                encodeLayout({
                    layout: this.layout,
                    contents: this.layoutContent,
                    includeVideo: true,
                }),
            )}`;
            return `${window.origin}/multiview${layoutParam}`;
        },
        collapseToolbar: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit("input", value);
            },
        },
    },
    methods: {
        startCopyToClipboard(txt) {
            this.copyToClipboard(txt);
            const thisCopy = this;
            setTimeout(() => {
                thisCopy.shareDialog = false;
            }, 200);
        },
        toggleMainNav() {
            return this.$store.commit("setNavDrawer", !this.$store.state.navDrawer);
        },
    },
};
</script>

<style lang="scss">
.mv-toolbar-btn .v-btn.v-btn--icon.v-size--default {
    // margin-right: 4px;
    height: 36px;
    width: 36px;
}

.mv-toolbar-btn.thin-scroll-bar::-webkit-scrollbar-track {
    background: rgba(99, 46, 46, 0.5);
}
.mv-toolbar-btn.thin-scroll-bar::-webkit-scrollbar-thumb {
    background: #f06291a2;
}
.mv-toolbar {
    z-index: 1;
}
</style>
