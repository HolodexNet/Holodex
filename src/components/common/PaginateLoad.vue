<template>
    <div :key="identifier" class="d-flex justify-center py-4" style="min-height: 100px">
        <LoadingOverlay :isLoading="status === STATUSES.LOADING" :showError="status === STATUSES.ERROR" />
        <template v-if="status !== STATUSES.LOADING">
            <v-pagination v-model="page" :length="pages" v-if="!pageLess"></v-pagination>
            <div v-else>
                <v-btn class="ma-2 pr-6" @click="page -= 1" :disabled="page === 1">
                    <v-icon>{{ mdiChevronLeft }}</v-icon>
                    {{ $t("component.paginateLoad.newer") }}
                </v-btn>
                <v-btn class="ma-2 pl-6" @click="page += 1" :disabled="status === STATUSES.COMPLETED">
                    {{ $t("component.paginateLoad.older") }}
                    <v-icon>{{ mdiChevronRight }}</v-icon>
                </v-btn>
            </div>
        </template>
    </div>
</template>

<script>
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";

export default {
    name: "PaginateLoad",
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
            status: 0,
            mdiChevronLeft,
            mdiChevronRight,
            isActive: true,
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
    },
    computed: {
        page: {
            get() {
                return Number(this.$route.query.page) || 1;
            },
            set(val) {
                this.$router.push({
                    query: {
                        ...this.$router.query,
                        page: val,
                    },
                });
            },
        },
    },
    mounted() {
        this.emitEvent();
    },
    activated() {
        this.isActive = true;
    },
    deactivated() {
        this.isActive = false;
    },
    watch: {
        identifier() {
            this.reset();
            // if page not 1, set it and let the route watcher handle emit
            if (this.page !== 1) {
                this.page = 1;
                return;
            }
            this.emitEvent();
        },
        // eslint-disable-next-line func-names
        "$route.query.page": function () {
            if (this.isActive) {
                this.emitEvent();
            }
        },
    },
    methods: {
        reset() {
            this.status = this.STATUSES.READY;
        },
        emitEvent() {
            this.$on("$PaginateLoad:completed", () => {
                this.status = this.STATUSES.COMPLETED;
            });
            this.$on("$PaginateLoad:loaded", () => {
                this.reset();
            });
            this.$on("$PaginateLoad:error", () => {
                this.status = this.STATUSES.ERROR;
            });
            const loaded = () => {
                this.$emit("$PaginateLoad:loaded", { target: this });
            };
            const completed = () => {
                this.$emit("$PaginateLoad:completed", { target: this });
            };
            const error = () => {
                this.$emit("$PaginateLoad:error", { target: this });
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
