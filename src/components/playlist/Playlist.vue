<template>
    <v-container fluid class="pa-0">
        <div style="font-size: 1rem !important; font-weight: 500" class="mb-2 ml-0">
            <v-hover v-slot="{ hover }">
                <v-text-field
                    :value="playlist.name"
                    @blur.prevent="
                        (x) => {
                            $emit('new-name', x);
                        }
                    "
                    autofocus
                    single-line
                    hide-details
                    :append-icon="icons.mdiPencil"
                    v-if="editNameMode"
                    @keydown.enter="editNameMode = false"
                    @click:append="editNameMode = false"
                    :rules="[(v) => v.length > 0 || 'Should not be empty']"
                >
                </v-text-field>
                <span class="text-h5" v-else>
                    <v-btn icon small class="float-left" v-show="hover && isEditable" @click="editNameMode = true">
                        <v-icon> {{ icons.mdiPencil }} </v-icon>
                    </v-btn>
                    {{ playlist.name }}
                </span>
            </v-hover>
            <v-menu bottom offset-y nudge-width="500">
                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" icon small class="float-right">
                        <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list nav>
                    <v-list-item @click="$emit('new-playlist')"
                        ><v-icon left color="success">{{ icons.mdiPlusBox }}</v-icon> New Playlist
                    </v-list-item>
                    <!-- feed back a green ripple on click... theoretically -->
                    <v-list-item @click="editNameMode = true"
                        ><v-icon left>{{ icons.mdiPencil }}</v-icon> Rename Playlist
                    </v-list-item>
                    <v-list-item :ripple="{ class: 'green--text' }" :disabled="!playlist.id"
                        ><v-icon left>{{ icons.mdiClipboardPlusOutline }}</v-icon>
                        {{ playlist.id ? "Copy sharable Playlist link" : "Save the playlist to enable link-sharing." }}
                    </v-list-item>
                    <v-divider />
                    <!-- Exporting options -->
                    <v-list-item disabled class="mt-1 mb-1" dense>
                        <v-icon left disabled>{{ icons.mdiOpenInNew }}</v-icon
                        ><span>Export Playlist</span>
                    </v-list-item>
                    <v-list-item dense @click.stop="instructionsDialog = true" class="ml-5">
                        <v-icon left>{{ icons.mdiYoutube }}</v-icon>
                        {{ $t("views.library.exportYtPlaylist") }}
                    </v-list-item>
                    <v-list-item dense @click.stop="downloadAsCSV" class="ml-5 mb-2">
                        <v-icon left>{{ mdiFileDelimited }}</v-icon>
                        {{ $t("views.library.exportCsv") }}
                    </v-list-item>
                    <!-- End Exporting options -->
                    <v-divider class="mb-2" />
                    <v-list-item @click="$emit('delete-playlist')"
                        ><v-icon left color="error">{{ icons.mdiDelete }}</v-icon>
                        {{ playlist.id ? "Delete Playlist" : "Clear playlist" }}
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn icon small class="float-right" v-show="!isSaved" color="success"
                ><v-icon>{{ mdiContentSave }}</v-icon></v-btn
            >
        </div>
        <VideoCardList
            :videos="playlist.videos || []"
            includeChannel
            :horizontal="horizontal"
            :cols="{
                xs: 1,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
            }"
        >
            <template v-slot:action="{ video }" v-if="isEditable">
                <div>
                    <v-btn icon>
                        <v-icon> {{ mdiChevronDoubleUp }} </v-icon>
                    </v-btn>
                    <v-btn icon>
                        <v-icon> {{ icons.mdiChevronUp }} </v-icon>
                    </v-btn>
                    <v-btn icon>
                        <v-icon> {{ icons.mdiDelete }} </v-icon>
                    </v-btn>
                    <v-btn icon>
                        <v-icon> {{ icons.mdiChevronDown }} </v-icon>
                    </v-btn>
                    <v-btn icon>
                        <v-icon> {{ mdiChevronDoubleDown }} </v-icon>
                    </v-btn>
                </div>
            </template>
        </VideoCardList>
        <!-- Saving video instructions for Youtube... -->
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
                            <v-btn class="mt-2 mx-2" color="green" @click="() => {}">
                                {{ $t("views.library.createYtPlaylistButton", [(playlist.videos || []).length]) }}
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
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import { Playlist } from "@/utils/types";
import { PropType } from "vue";
import { mdiContentSave, mdiFileDelimited, mdiChevronDoubleUp, mdiChevronDoubleDown } from "@mdi/js";

export default {
    name: "Playlist",
    components: {
        VideoCardList,
    },
    props: {
        playlist: {
            type: Object as PropType<Playlist>,
            required: true,
        },
        isEditable: {
            type: Boolean,
            required: false,
            default: false,
        },
        isSaved: {
            type: Boolean,
            required: false,
            default: false,
        },
        horizontal: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            mdiContentSave,
            mdiFileDelimited,
            mdiChevronDoubleUp,
            mdiChevronDoubleDown,
            editNameMode: false,
            instructionsDialog: false,
        };
    },
};
</script>

<style></style>
