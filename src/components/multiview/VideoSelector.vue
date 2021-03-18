<template>
    <v-card class="pa-3">
        <v-row>
            <v-col cols="12" sm="4" md="2" style="border-right: 1px solid white">
                <v-card-title>Select Live</v-card-title>
                <v-select
                    :items="orgList"
                    filled
                    v-model="selectedOrg"
                    mandatory
                    v-if="$vuetify.breakpoint.name === 'xs'"
                ></v-select>
                <v-list-item-group v-model="selectedOrg" mandatory v-else>
                    <template v-for="org in orgList">
                        <v-list-item :key="org.value">
                            <v-list-item-content>
                                <v-list-item-title>{{ org.text }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-list-item-group>
            </v-col>
            <v-col cols="12" sm="8" md="10" style="max-height: 100%; overflow-y: auto">
                <template v-if="selectedOrg === 1">
                    <div class="text-h5">Add Custom Video</div>
                    <v-text-field
                        label="Youtube Video Link"
                        hint="https://www.youtube.com/watch?v=..."
                        v-model="customURL"
                        :error="customURLError"
                    ></v-text-field>
                    <v-btn @click="addCustomVideo"> Add </v-btn>
                </template>
                <template v-else>
                    <LoadingOverlay :isLoading="isLoading" :showError="hasError" />
                    <VideoCardList
                        :videos="live"
                        horizontal
                        @videoClicked="handleVideoClick"
                        disableDefaultClick
                        includeChannel
                    ></VideoCardList>
                </template>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
import api from "@/utils/backend-api";
import VideoCardList from "@/components/video/VideoCardList";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { ORGS, VIDEO_URL_REGEX } from "@/utils/consts";

export default {
    name: "VideoSelector",
    components: {
        VideoCardList,
        LoadingOverlay,
    },
    data() {
        return {
            live: [],
            selectedOrg: 0,
            ORGS,
            isLoading: false,
            hasError: false,

            customURL: "",
            customURLError: false,
        };
    },
    watch: {
        selectedOrg() {
            if (this.selectedOrg === 1) {
                return;
            }
            if (this.selectedOrg === 0) {
                this.loadFavorites();
                return;
            }
            this.loadOrg(this.orgList[this.selectedOrg].text);
        },
    },
    computed: {
        orgList() {
            const arr = [
                {
                    text: "Favorites",
                    value: 0,
                },
                {
                    text: "Custom",
                    value: 1,
                },
                ...this.ORGS.map((orgName, index) => {
                    return {
                        text: orgName,
                        value: index + 2,
                    };
                }),
            ];
            return arr;
        },
    },
    methods: {
        handleVideoClick(video) {
            this.$emit("videoClicked", video);
        },
        addCustomVideo() {
            const match = this.customURL.match(VIDEO_URL_REGEX);
            if (match && match[1] && match[1].length === 11) {
                this.customURLError = false;
                this.$emit("videoClicked", {
                    id: match[1],
                    channel: {
                        name: match[1],
                    },
                });
            } else {
                this.customURLError = true;
            }
        },
        loadFavorites() {
            this.live = [];
            this.isLoading = true;
            api.favoritesLive({
                channels: this.$store.state.favorites.favorites.map((f) => f.id).join(","),
            })
                .then((data) => {
                    data.sort((a, b) => {
                        const dateA = new Date(a.available_at).getTime();
                        const dateB = new Date(b.available_at).getTime();
                        return dateA > dateB ? 1 : -1;
                    });
                    console.log(data);
                    this.live = data;
                })
                .catch((e) => {
                    console.error(e);
                    this.hasError = false;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        loadOrg(orgName) {
            this.live = [];
            this.isLoading = true;
            api.live({
                org: orgName,
            })
                .then((res) => {
                    this.live = res;
                })
                .catch((e) => {
                    console.error(e);
                    this.hasError = false;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
    },
};
</script>

<style></style>
