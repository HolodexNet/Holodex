<template>
    <v-autocomplete
        v-model="query"
        :loading="isLoading"
        :items="results"
        :search-input.sync="search"
        @input="onInput"
        style="max-width: 500px"
        class="ma-auto"
        solo-inverted
        chips
        multiple
        deletable-chips
        disable-lookup
        clearable
        :append-icon="''"
        :append-outer-icon="mdiMagnify"
        @click:append-outer="commitSearch"
        hide-no-data
        hide-selected
    >
        <template v-slot:selection="selection">
            <v-chip
                pill
                close
                :label="selection.item.value.type !== 'channel'"
                @click:close="deleteChip(selection.item)"
            >
                <template v-if="selection.item.value.type === 'channel'">
                    <v-avatar left>
                        <ChannelImg
                            :src="selection.item.value.channel_obj.photo"
                            :size="32"
                            close
                        />
                    </v-avatar>
                    {{ selection.item.text }}
                </template>
                <template v-else> #{{ selection.item.text }} </template>
            </v-chip>
        </template>
        <template v-slot:item="dropdownItem">
            <v-list-item-avatar v-if="dropdownItem.item.value.type === 'channel'">
                <ChannelImg :src="dropdownItem.item.value.channel_obj.photo" />
            </v-list-item-avatar>
            <v-list-item-avatar v-else>
                <v-icon>{{ mdiLabel }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
                {{
                    (dropdownItem.item.value.type !== "channel"? "#": "") + dropdownItem.item.text
                }}
            </v-list-item-content>
        </template>
    </v-autocomplete>
</template>

<script>
import { mdiMagnify, mdiLabel } from "@mdi/js";
import ChannelChip from "@/components/ChannelChip";
import api from "@/utils/backend-api";
import ChannelImg from "@/components/ChannelImg";
export default {
    name: "SearchBar",
    components: {
        // eslint-disable-next-line vue/no-unused-components
        ChannelChip,
        ChannelImg,
    },
    data() {
        return {
            query: null,
            mdiMagnify,
            mdiLabel,
            isLoading: false,
            search: null,
            fromApi: [],
            fromChannelCache: [],
            useEnName: true,
        };
    },
    computed: {
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        results() {
            return this.fromApi.concat(
                this.query
                    ? this.query.map(item => {
                          return {
                              text:
                                  item.type === "channel"
                                      ? item.channel_obj[this.nameProperty]
                                      : item.tag_obj.name,
                              value: item,
                          };
                      })
                    : []
            );
        },
        nameProperty() {
            return this.useEnName ? "name_en" : "name";
        },
    },
    watch: {
        query() {
            // console.log("watch - " + this.query.map(q => q.name).join(","));
            // // this.search = null;
        },
        search(val) {
            if (!val) return;
            const formatted = val.replaceAll("#", "").toLowerCase();

            this.fetchTags(formatted).then(res => {
                const currentTagIds = this.query
                    ? this.query.map(item => item.tag_id)
                    : [];
                const filtered = res.data.tags.filter(
                    tag => !currentTagIds.includes(tag.id)
                );
                this.fromApi = filtered.map(tag => {
                    if (tag.channel_ref) {
                        const ref = this.cachedChannels[tag.channel_ref];
                        ref.search_type = "channel";
                        return {
                            text: ref[this.nameProperty] + ` (${tag.tag_count})`,
                            value: {
                                tag_id: tag.id,
                                tag_obj: tag,
                                type: "channel",
                                channel_obj: ref,
                            },
                        };
                    } else {
                        tag.search_type = "Tag";
                        return {
                            text: tag.name + ` (${tag.tag_count})`,
                            value: {
                                tag_id: tag.id,
                                tag_obj: tag,
                                type: "tag",
                            },
                        };
                    }
                });
            });
        },
    },
    methods: {
        // onChange(event) {
        //     console.log(this.query);
        //     console.log(event);
        // },
        // onKeyDown(event) {
        //     console.log(event);
        // },
        async fetchTags(query) {
            this.loading = true;
            const res = await api.searchTags(query, 10);
            // this.fromApi = res.data.tags;
            this.loading = false;
            return res;
        },
        deleteChip(item) {
            this.query.splice(this.query.map(q => q.name).indexOf(item.value.name), 1);
        },
        commitSearch() {
            console.log("search commited");
            console.log(this.query);
        },
        onInput() {
            this.search = null;
            this.fromApi = [];
        },
    },
};
</script>

<style></style>
