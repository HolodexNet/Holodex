<template>
    <v-container>
        <v-row class="d-flex justify-space-between">
            <v-col>
                <div class="text-h6 mb-2">
                    {{ $t("views.library.savedVideosTitle") }}
                </div>
                <div class="d-flex flex-row flex-wrap">
                    <v-btn class="mr-1 mb-1" color="blue-grey" @click="showReset ? reset() : selectAll()">
                        {{ showReset ? $t("views.library.selectionReset") : $t("views.library.selectionSelectAll") }}
                    </v-btn>
                    <v-btn v-if="!showReset" class="mr-1 mb-1" color="blue-grey" @click="select(50)">
                        {{ $t("views.library.selectionSelect50") }}
                    </v-btn>

                    <v-menu>
                        <template #activator="{ on }">
                            <v-btn class="mr-1 mb-1" color="green darken-2" v-on="on">
                                {{ $t("views.library.exportSelected", [selected.length]) }}
                            </v-btn>
                        </template>
                        <v-list dense>
                            <v-list-item-group>
                                <v-list-item @click.stop="instructionsDialog = true">
                                    <v-list-item-icon>
                                        <v-icon>{{ icons.mdiYoutube }}</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>{{
                                        $t("views.library.exportYtPlaylist")
                                    }}</v-list-item-content>
                                </v-list-item>
                                <v-list-item @click.stop="downloadAsCSV">
                                    <v-list-item-icon>
                                        <v-icon>{{ mdiFileTable }}</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>{{ $t("views.library.exportCsv") }}</v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>
                        </v-list>
                    </v-menu>

                    <!-- <v-btn class="mr-1 mb-1" color="green" @click="exportSelected">
                        {{ $t("views.library.createYtPlaylistButton", [selected.length]) }}
                    </v-btn> -->
                    <v-dialog v-model="deleteDialog" max-width="290">
                        <template #activator="{ on, attrs }">
                            <v-btn color="red" class="mr-2 mb-1" v-bind="attrs" v-on="on">
                                {{ $t("views.library.deleteFromLibraryButton", [selected.length]) }}
                            </v-btn>
                        </template>
                        <!-- Deletion confirm dialog -->
                        <v-card>
                            <v-card-title>
                                {{ $t("views.library.deleteConfirmation", [selected.length]) }}
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text @click="deleteDialog = false">
                                    {{ $t("views.library.deleteConfirmationCancel") }}
                                </v-btn>
                                <v-btn
                                    color="red darken-1"
                                    text
                                    @click="
                                        deleteDialog = false;
                                        deleteSelected();
                                    "
                                >
                                    {{ $t("views.library.deleteConfirmationOK") }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <!-- <div class="d-inline-block"> -->
                    <v-select
                        v-model="sortModel"
                        class="d-inline-flex align-self-center mt-n1"
                        :prepend-inner-icon="mdiSort"
                        :items="sortby"
                        dense
                        filled
                        hide-details
                    >
                    </v-select>
                    <!-- </div> -->
                </div>
            </v-col>
        </v-row>
        <generic-list-loader
            v-if="savedVideosList.length > 0"
            v-slot="{ data }"
            :key="'vl-home-' + sortModel + '=' + savedVideosList.length"
            :paginate="true"
            :per-page="50"
            :load-fn="getLoadFn()"
        >
            <VideoCardList :videos="data" horizontal include-channel dense>
                <template #action="prop">
                    <v-checkbox
                        v-model="selected"
                        :ripple="false"
                        :value="prop.video.id"
                        hide-details
                        @click.prevent.stop
                    />
                </template>
            </VideoCardList>
        </generic-list-loader>
        <div v-else class="text-center">
            {{ $t("views.library.emptyLibrary") }}
        </div>
        <v-dialog v-model="instructionsDialog" :width="$store.state.isMobile ? '90%' : '60vw'">
            <v-card>
                <v-card-title>{{ $t("views.library.exportYTHeading") }}</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="">
                            <p v-html="$t('views.library.exportYTExplanation')"></p>
                            <br />

                            <br />
                            <p v-html="$t('views.library.exportYTInstructions')"></p>
                            <v-btn class="mt-2 mx-2" color="green" @click="exportSelected">
                                {{ $t("views.library.createYtPlaylistButton", [selected.length]) }}
                            </v-btn>
                            <v-btn class="mt-2 mx-2" @click="instructionsDialog = false">{{
                                $t("views.library.deleteConfirmationCancel")
                            }}</v-btn>
                        </v-col>
                        <v-col cols="12" md="auto">
                            <img src="/img/playlist-instruction.jpg" />
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions> </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import { mdiFileTable, mdiSort } from "@mdi/js";
import { json2csvAsync } from "json-2-csv";
import GenericListLoader from "@/components/video/GenericListLoader.vue";

const SORT_OPTIONS = [
    { cat: "added_at", asc: -1 },
    { cat: "added_at", asc: 1 },
    { cat: "available_at", asc: -1 },
    { cat: "available_at", asc: 1 },
];

export default {
    name: "Library",
    metaInfo() {
        const vm = this;
        return {
            get title() {
                return `${vm.$t("component.mainNav.library")} - Holodex`;
            },
        };
    },
    components: {
        VideoCardList,
        GenericListLoader,
    },
    data() {
        return {
            mdiFileTable,
            selected: [],
            deleteDialog: false,
            instructionsDialog: false,

            mdiSort,
            sortby: [
                {
                    text: this.$t("views.library.sort.dateaddedLatestFirst"),
                    value: 0,
                },
                {
                    text: this.$t("views.library.sort.dateaddedEarliestFirst"),
                    value: 1,
                },
                {
                    text: this.$t("views.library.sort.dateuploadedLatestFirst"),
                    value: 2,
                },
                {
                    text: this.$t("views.library.sort.dateuploadedEarliestFirst"),
                    value: 3,
                },
            ],
            sortModel: 0,
        };
    },
    computed: {
        savedVideos() {
            return this.$store.state.library.savedVideos;
        },
        savedVideosList() {
            const sortStyle = SORT_OPTIONS[this.sortModel];
            return Object.values(this.savedVideos).sort((a: any, b: any) => {
                const dateA = new Date(a[sortStyle.cat]).getTime();
                const dateB = new Date(b[sortStyle.cat]).getTime();
                return dateA > dateB ? 1 * sortStyle.asc : -1 * sortStyle.asc;
            });
        },
        showReset() {
            return this.selected.length !== 0;
        },
    },
    created() {},
    methods: {
        selectAll() {
            this.selected = this.savedVideosList.map((v) => v.id);
        },
        select(n) {
            this.selected = this.savedVideosList.slice(0, n).map((v) => v.id);
        },
        reset() {
            this.selected = [];
        },
        deleteSelected() {
            this.selected.forEach((id) => {
                this.$store.commit("library/removeSavedVideo", id);
            });
            this.reset();
        },
        exportSelected() {
            if (this.selected.length === 0) return;
            const url = `https://www.youtube.com/watch_videos?video_ids=${this.selected.join(",")}`;

            window.open(url, "_blank", "noopener");
            this.reset();
        },
        async downloadAsCSV() {
            const selectedSet = new Set(this.selected);
            const csvString = await json2csvAsync(this.savedVideosList.filter((v) => selectedSet.has(v.id)));
            const a = document.createElement("a");
            const timestamp = new Date().toISOString().replace("T", "_").substr(0, 19);
            a.href = `data:attachment/csv,${encodeURIComponent(csvString)}`;
            a.target = "_blank";
            a.download = `holodexPlaylist_${timestamp}.csv`;

            document.body.appendChild(a);
            a.click();
        },
        getLoadFn() {
            return async (offset, limit) => {
                const res = {
                    total: this.savedVideosList.length,
                    items: this.savedVideosList.slice(offset, offset + limit),
                };
                return res;
            };
        },
    },
};
</script>

<style></style>
