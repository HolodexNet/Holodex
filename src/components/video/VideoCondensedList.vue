<template>
    <div class="condensed-video-list">
        <a :href="`/watch/${video.id}`" class="condensed-video" v-for="video of videos">
            <div class="condensed-col-image">
                <ChannelImg :channel="video.channel" rounded />
            </div>
            <div class="condensed-col condensed-col-title">
                {{ video.title }}
                <div class="condensed-col-status-mobile" v-bind:class="{ 'text-live': video.status === 'live' }">
                    {{ formattedTime(video) }}
                </div>
            </div>
            <div class="condensed-col condensed-col-status" v-bind:class="{ 'text-live': video.status === 'live' }">
                {{ formattedTime(video) }}
            </div>
        </a>
    </div>
</template>

<script lang="ts">
import {
    getVideoThumbnails,
} from "@/utils/functions";
import backendApi from "@/utils/backend-api";
import {
    formatDuration,
    formatDistance,
    dayjs,
    localizedDayjs,
} from "@/utils/time";

export default {
    name: "VideoCondensedList",
    components: {
        ChannelImg: () => import("@/components/channel/ChannelImg.vue"),
    },
    mixins: [],
    props: {
        videos: {
            required: true,
            type: Array,
        }
    },
    data() {
        return {
        };
    },
    computed: {
    },
    watch: {
    },
    methods: {
        formatDistanceUpcoming(video) {
            const allowNegative = false; // upcoming videos don't get to be ("5 minutes ago")
            return formatDistance(
                video.start_scheduled || video.available_at,
                this.lang,
                this.$t.bind(this),
                allowNegative,
                dayjs(this.now),
            );
        },
        formatDistanceDefault(video) {
            return formatDistance(
                video.available_at,
                this.lang,
                this.$t.bind(this),
            );
        },
        formattedTime(video) {
            switch (video.status) {
                case "upcoming":
                    return this.formatDistanceUpcoming(video);
                case "live":
                    return this.$t("component.videoCard.liveNow");
                default:
                    return this.formatDistanceDefault(video);
            }
        }
    },
};
</script>

<style lang="scss">
.condensed-headers {
    display: flex;
    width: 100%;
    font-weight: bold;
    padding-top: 10px;
    padding-bottom: 10px;
}

.condensed-video-list {
    margin: auto;
    margin-top: 12px;
    max-width: 1200px;
}

a.condensed-video {
    text-decoration: none;
    color: inherit !important;
}

.condensed-video {
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-right: 10px;

    width: 100%;

    background-color: rgba(255, 255, 255, 0.05);
    border-top: 1px solid;
    border-color: var(--v-background-lighten1);
    border-width-bottom: 1px;

    &:hover {
        background: var(--v-background-lighten1);
    }
}

.condensed-col {
    min-height: 40px;
    line-height: 40px;
    padding-left: 10px;
}

.condensed-col-status {
    min-width: 265px;
    text-align: right;
}

.condensed-col-image {
    width: calc(40px + 12px);
    padding-left: 10px;
}

.condensed-col-title {
    max-width: 100%;
    flex-grow: 1;
}

.text-live {
    color: red;
}

.condensed-col-status-mobile {
    display: none;
}

@media only screen and (max-width: 600px) {
    .condensed-video-list {
        margin-top: 0;
    }

    .condensed-col-organization {
        display: none;
    }

    .condensed-col {
        width: default;
        line-height: inherit;
    }

    .condensed-col-status {
        display: none;
    }

    .condensed-col-status-mobile {
        display: block;
        margin-top: 1rem;
    }
}

</style>
