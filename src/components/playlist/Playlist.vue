<template>
    <v-container fluid class="pa-0">
        <div style="font-size: 1rem !important; font-weight: 500" class="mb-2 ml-0">
            <v-hover v-slot="{ hover }">
                <v-text-field
                    :value="playlist.name"
                    @input.prevent="
                        (x) => {
                            emit('new-name', x);
                        }
                    "
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
            <v-menu bottom offset-y>
                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" icon small class="float-right">
                        <v-icon>{{ icons.mdiDotsVertical }}</v-icon>
                    </v-btn>
                </template>
                <v-list-item
                    ><v-icon left color="success">{{ icons.mdiPlusBox }}</v-icon> New Playlist</v-list-item
                >
                <v-list-item
                    ><v-icon left color="error">{{ icons.mdiDelete }}</v-icon> Delete</v-list-item
                >
            </v-menu>
            <v-btn icon small class="float-right"
                ><v-icon>{{ mdiContentSave }}</v-icon></v-btn
            >
        </div>
        <VideoCardList
            :videos="playlist.videos"
            includeChannel
            :horizontal="horizontal"
            :cols="{
                xs: 1,
                sm: 3,
                md: 4,
                lg: 5,
                xl: 6,
            }"
        ></VideoCardList>
    </v-container>
</template>

<script lang="ts">
import VideoCardList from "@/components/video/VideoCardList.vue";
import { Playlist } from "@/utils/types";
import { PropType } from "vue";
import { mdiContentSave } from "@mdi/js";

export default {
    name: "FavoritesVideoList",
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
            editNameMode: false,
        };
    },
};
</script>

<style></style>
