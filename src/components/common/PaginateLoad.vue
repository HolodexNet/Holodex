<template>
    <div :key="identifier" class="d-flex justify-center py-4" style="min-height: 100px" @click.capture="clicked = true">
        <!-- <LoadingOverlay :isLoading="status === STATUSES.LOADING" :showError="status === STATUSES.ERROR" /> -->
        <!-- <template> -->
        <v-pagination
            v-model="page"
            :length="pages"
            v-if="!pageLess"
            :total-visible="TOTAL_PAGINATION_COUNT[$vuetify.breakpoint.name]"
            v-show="status === STATUSES.READY || status === STATUSES.COMPLETED"
        ></v-pagination>
        <div v-show="status === STATUSES.READY || status === STATUSES.COMPLETED" v-else>
            <v-btn class="ma-2 pr-6" @click="page -= 1" :disabled="page === 1">
                <v-icon>{{ icons.mdiChevronLeft }}</v-icon>
                {{ $t("component.paginateLoad.newer") }}
            </v-btn>
            <v-btn class="ma-2 pl-6" @click="page += 1" :disabled="status === STATUSES.COMPLETED">
                {{ $t("component.paginateLoad.older") }}
                <v-icon>{{ icons.mdiChevronRight }}</v-icon>
            </v-btn>
        </div>
        <!-- </template> -->
    </div>
</template>

<script lang="ts">
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";
import isActive from "@/mixins/isActive";

export default {
    name: "PaginateLoad",
    mixins: [isActive],
    components: {
        LoadingOverlay,
    },
    data() {
        return {
            STATUSES: Object.freeze({
                READY: 0,
                LOADING: 1,
                ERROR: 2,
                COMPLETED: 3,
            }),
            status: 1,
            // lastPage: 1,
            clicked: false,
            TOTAL_PAGINATION_COUNT: Object.freeze({
                xs: 5,
                sm: 8,
                md: 12,
                lg: 14,
                xl: 16,
            }),
        };
    },
    props: {
        identifier: {
            default: +new Date(),
        },
        pages: {
            default: 1,
            type: Number,
        },
        pageLess: {
            default: false,
            type: Boolean,
        },
        scrollElementId: {
            default: null,
            type: String,
        },
    },
    activated() {
        // page has changed between activation/deactivation, resync
        // if (this.lastPage !== this.page) {
        //     this.emitEvent();
        // }
    },
    computed: {
        page: {
            get() {
                return Number(this.$route.query.page || 1);
            },
            set(val) {
                // cannot be set unless status = READY (due to visibility of DOM element)
                // this.lastPage = this.page;
                this.$router.push({
                    query: {
                        ...this.$route.query,
                        page: val,
                    },
                });
            },
        },
    },
    mounted() {
        // this.status = this.STATUSES.LOADING;
        this.emitEvent();
    },
    watch: {
        identifier() {
            this.reset();

            // if page not 1, set it and let the route watcher handle emit
            if (this.page !== 1) {
                this.page = 1;
                // return;
            }
            // emitevent pretend it's remounted
            if (this.isActive) this.emitEvent();
        },
        // eslint-disable-next-line func-names
        "$route.query.page": function (nw, old) {
            // only emit if component is active and page changed
            if (this.isActive && nw !== old) {
                this.emitEvent();
            }
        },
    },
    methods: {
        reset() {
            this.status = this.STATUSES.READY;
        },
        // eslint-disable-next-line func-names
        emitEvent() {
            // this.$on("$PaginateLoad:completed", () => {
            //     this.status = this.STATUSES.COMPLETED;
            // });
            // this.$on("$PaginateLoad:loaded", () => {
            //     this.reset();
            // });
            // this.$on("$PaginateLoad:error", () => {
            //     this.status = this.STATUSES.ERROR;
            // });
            const loaded = () => {
                // this.$emit("$PaginateLoad:loaded", { target: this });
                this.status = this.STATUSES.READY;
                if (this.clicked && this.scrollElementId)
                    window.scrollTo(0, document.getElementById(this.scrollElementId).offsetTop - 100);
            };
            const completed = () => {
                this.status = this.STATUSES.COMPLETED;
                // this.$emit("$PaginateLoad:completed", { target: this });
            };
            const error = () => {
                this.status = this.STATUSES.ERROR;
                // this.$emit("$PaginateLoad:error", { target: this });
            };

            const $state = {
                page: this.page,
                loaded,
                completed,
                error,
            };
            this.$emit("paginate", $state);
            this.status = this.STATUSES.LOADING;
        },
    },
};
</script>

<style></style>
