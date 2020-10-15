<template>
    <!-- <v-autocomplete
        class="ma-auto search-bar"
        solo
        flat
        chips
        multiple
        deletable-chips
        disable-lookup
        clearable
        hide-no-data
        hide-selected
        hide-details
        auto-select-first
        dense
        :autofocus="autofocus"
        :small-chips="dense"
        v-model="query"
        :loading="isLoading"
        :items="results"
        :search-input.sync="search"
        @input="onInput"
        :append-icon="''"
        :append-outer-icon="mdiMagnify"
        @click:append-outer="commitSearch"
        @keydown.enter="onKeyDown()"
        label="Search"
        return-object
    > -->
    <v-autocomplete
        class="ma-auto search-bar"
        v-model="query"
        :items="results"
        :search-input.sync="search"
        :append-icon="''"
        :append-outer-icon="mdiMagnify"
        @click:append-outer="commitSearch"
        autocomplete="off"
    >
        <template v-slot:selection="selection">
            <v-chip
                pill
                close
                :label="selection.item.value.type !== 'channel'"
                @click:close="deleteChip(selection.item)"
                :small="dense"
            >
                <template v-if="selection.item.value.type === 'channel'">
                    <v-avatar left v-if="!dense">
                        <ChannelImg
                            :channel="selection.item.value.channel_obj"
                            :size="32"
                            close
                        />
                    </v-avatar>
                    {{ selection.item.text }}
                </template>
                <template v-else> #{{ selection.item.text }} </template>
            </v-chip>
        </template>
        <!-- <template v-slot:item="dropdownItem">
            <v-list-item-avatar
                v-if="dropdownItem.item.value.type === 'channel'"
            >
                <ChannelImg :channel="dropdownItem.item.value.channel_obj" />
            </v-list-item-avatar>
            <v-list-item-avatar v-else>
                <v-icon>{{ mdiLabel }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
                {{
                    (dropdownItem.item.value.type !== "channel" ? "#" : "") +
                        dropdownItem.item.text +
                        ` (${dropdownItem.item.value.tag_obj.count})`
                }}
            </v-list-item-content>
        </template> -->
    </v-autocomplete>
</template>

<script>
import { mdiMagnify, mdiLabel } from "@mdi/js";
import ChannelChip from "@/components/ChannelChip";
import api from "@/utils/backend-api";
import ChannelImg from "@/components/ChannelImg";
// import { debounce } from "@/utils/functions";

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
        };
    },
    props: {
        dense: {
            type: Boolean,
            default: false,
        },
        autofocus: {
            type: Boolean,
            default: false,
        },
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
            return this.$store.state.nameProperty;
        },
    },
    watch: {
        search: 
        /*debounce(*/function(val) {
            this.debug();
            if (!val) return;
            const formatted = val.replace("#", "").toLowerCase();
            alert(formatted);
            this.fetchTags(formatted).then(res => {
                const currentTagIds = this.query
                    ? this.query.map(item => item.tag_id)
                    : [];
                const filtered = res.data.tags.filter(
                    tag => !currentTagIds.includes(tag.id)
                );
                this.fromApi = filtered.map(tag => {
                    if (
                        tag.channel_ref &&
                        this.cachedChannels[tag.channel_ref]
                    ) {
                        const ref = this.cachedChannels[tag.channel_ref];
                        return {
                            text: ref[this.nameProperty],
                            value: {
                                tag_id: tag.id,
                                tag_obj: tag,
                                type: "channel",
                                channel_obj: ref,
                            },
                        };
                    } else {
                        return {
                            text: tag.name,
                            value: {
                                tag_id: tag.id,
                                tag_obj: tag,
                                type: "tag",
                            },
                        };
                    }
                });
            }).catch(e => alert(e))
            .finally(() => alert(this.fromApi));
         }, 
         //200),
    },
    methods: {
        onKeyDown() {
            this.debug();
            if (this.fromApi.length == 0) this.commitSearch();
        },
        async fetchTags(query) {
            this.isLoading = true;
            const res = await api.searchTags(query, 10);
            this.isLoading = false;
            return res;
        },
        deleteChip(item) {
            this.query.splice(
                this.query.map(q => q.tag_id).indexOf(item.value.tag_id),
                1
            );
        },
        commitSearch() {
            if (!this.query && !this.search) return;
            this.debug();
            this.$router.push({
                path: "/search",
                query: {
                    ...(this.query && {
                        tags: this.query
                            .map(tag => tag.tag_obj.name)
                            .sort()
                            .join(","),
                    }),
                    ...(this.search && { title: this.search }),
                },
            });
        },
        onInput() {
            // this.search = null;
            // this.fromApi = [];
        },
        debug() {
            console.log(
                `${JSON.stringify(this.query)}
                ${this.isLoading},
                ${this.search}`
            );
        },
    },
};
</script>

<style>
.search-bar {
    max-width: 550px !important;
}
.search-bar.v-input--dense > .v-input__append-outer {
    background-color: #424242;
    min-width: 48px;
    min-height: 48px;
    margin: 0 !important;
    align-items: center;
    border-radius: inherit;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}
.search-bar.v-input--dense > .v-input__append-outer {
    min-width: 38px;
    min-height: 38px;
    margin: 0 !important;
}

.search-bar.v-input > .v-input__control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    height: 38px !important;
}

.search-bar > .v-input__append-outer > .v-input__icon > .v-icon {
    color: gray !important;
}

.search-bar > .v-input__append-outer > .v-input__icon > .v-icon.primary--text {
    color: white !important;
}

.search-bar.theme--light > .v-input__append-outer {
    background-color: #eee;
}

/* .search-bar.theme--light > .v-input__append-outer > .v-input__icon > .v-icon {
    color: black !important;
} */
</style>
