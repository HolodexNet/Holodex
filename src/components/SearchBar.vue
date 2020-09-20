<template>
    <v-autocomplete
        v-model="query"
        :loading="isLoading"
        :items="results"
        :search-input.sync="search"
        style="max-width: 800px"
        class="ma-auto"
        solo-inverted
        chips
        multiple
        deletable-chips
        :filter="customFilter"
    >
        <template v-slot:selection="selection">
            <ChannelChip
                :channel="selection.item.value"
                v-if="selection.item.type === 'channel'"
            />
            <v-chip class="ma-2" label v-else>
                #{{ selection.item.text }}
            </v-chip>
        </template>
        <!-- <template v-slot:item="i">
            <span v-if="!i.item.disabled">{{ i.item.text }}</span>
        </template> -->
    </v-autocomplete>
</template>

<script>
import { mdiMagnify } from "@mdi/js";
import ChannelChip from "@/components/ChannelChip";
import api from "@/utils/backend-api";
export default {
    name: "SearchBar",
    components: {
        ChannelChip,
    },
    data() {
        return {
            query: null,
            mdiMagnify,
            // results: [],
            isLoading: false,
            search: null,
            fromApi: [],
            fromChannelCache: [],
        };
    },
    computed: {
        cachedChannels() {
            return this.$store.state.cachedChannels;
        },
        normalizedChannel() {
            console.log(this.$store.state.cachedChannels);
            return Object.values(this.cachedChannels).map(channel => {
                console.log(channel);
                return {
                    id: channel.id,
                    searchTerm: (channel.name_en + channel.name)
                        .split(" ")
                        .join("")
                        .toLowerCase(),
                };
            });
        },
        results() {
            return this.fromChannelCache.concat(this.fromApi).concat(
                this.query
                    ? this.query.map(item => {
                          return {
                              text: item.name,
                              value: item,
                              disabled: true,
                              type: item.channel_type ? "channel" : "tag",
                          };
                      })
                    : []
            );
        },
    },
    watch: {
        query() {
            console.log("watch - " + this.query);
            // this.search = null;
        },
        search(val) {
            if (!val) return;
            this.fetchTags(val);
            const formatted = val.replaceAll("#", "").toLowerCase();
            if (this.query) this.query.forEach(item => (item.disabled = true));
            this.fromChannelCache = this.normalizedChannel
                .filter(channel => {
                    return channel.searchTerm.indexOf(formatted) !== -1;
                })
                .splice(0, 10)
                .map(channel => {
                    return {
                        text: this.cachedChannels[channel.id].name,
                        value: this.cachedChannels[channel.id],
                        type: "channel",
                    };
                });

            this.fetchTags(formatted).then(res => {
                this.fromApi = res.data.tags.map(tag => {
                    return {
                        text: tag.name,
                        value: tag,
                        type: "tag",
                    };
                });
                console.log(res);
            });

            //             .concat(
            //     this.query
            //         ? this.query.map(item => {
            //               return {
            //                   text: item.name,
            //                   value: item,
            //                   disabled: true,
            //               };
            //           })
            //         : []
            // );
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
        customFilter() {
            return true;
        },
        async fetchTags(query) {
            this.loading = true;
            const res = await api.searchTags(query, 10);
            // this.fromApi = res.data.tags;
            this.loading = false;
            return res;
        },
    },
};
</script>

<style></style>
