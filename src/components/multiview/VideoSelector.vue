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
                <VideoCardList
                    :videos="live"
                    horizontal
                    @videoClicked="handleVideoClick"
                    disableDefaultClick
                    includeChannel
                ></VideoCardList>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
import api from "@/utils/backend-api";
import VideoCardList from "@/components/video/VideoCardList";
import { ORGS } from "@/utils/consts";

export default {
    name: "VideoSelector",
    components: {
        VideoCardList,
    },
    data() {
        return {
            // favoritesLive: [],
            live: [],
            selectedOrg: 0,
            ORGS,
        };
    },
    mounted() {
        // this.loadFavorites();
        this.loadOrg("Hololive");
    },
    watch: {
        selectedOrg() {
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
                ...this.ORGS.map((orgName, index) => {
                    return {
                        text: orgName,
                        value: index + 1,
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
        loadFavorites() {
            api.favoritesLive({
                channels: this.$store.state.favorites.favorites.map((f) => f.id).join(","),
            }).then((data) => {
                data.sort((a, b) => {
                    const dateA = new Date(a.available_at).getTime();
                    const dateB = new Date(b.available_at).getTime();
                    return dateA > dateB ? 1 : -1;
                });
                console.log(data);
                this.live = data;
            });
        },
        loadOrg(orgName) {
            api.live({
                org: orgName,
            })
                .then((res) => {
                    this.live = res;
                })
                .catch((e) => {
                    console.error(e);
                });
        },
    },
};
</script>

<style></style>
