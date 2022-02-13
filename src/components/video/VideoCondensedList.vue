<template>
    <div>
        <div class="condensed-headers">
            <div class="condensed-col condensed-col-title">
                Title
            </div>
            <div class="condensed-col-image">
            </div>
            <div class="condensed-col">
                Channel
            </div>
            <div class="condensed-col condensed-col-organization">
                Organization
            </div>
            <div class="condensed-col">
                Status
            </div>
        </div>
        <a :href="`/watch/${video.id}`" class="condensed-video" v-for="video of videos">
            <div class="condensed-col condensed-col-title">
                {{ video.title }}
            </div>
            <div class="condensed-col-image">
                <ChannelImg :channel="video.channel" rounded class="align-self-center" />
            </div>
            <div class="condensed-col">
                <a :href="`/channel/${video.channel.id}`">
                    {{ video.channel.english_name }}
                </a>
            </div>
            <div class="condensed-col condensed-col-organization">
                {{ video.channel.org }}
            </div>
            <div class="condensed-col" v-bind:class="{ 'text-live': video.status === 'live' }">
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

a.condensed-video {
    text-decoration: none;
    color: inherit !important;
}

.condensed-video {
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
    width: 100%;

    &:nth-child(2n) {
        background: var(--v-background-lighten1);
    }

    &:hover {
        background: var(--v-background-lighten2);
    }
}

.condensed-col {
    width: 16.7%;
    min-height: 40px;
    line-height: 40px;
    padding-left: 10px;
    padding-right: 10px;
}

.condensed-col-image {
    width: calc(40px + 8px);
}

.condensed-col-title {
    width: 50%;
}

.text-live {
    color: red;
}

@media only screen and (max-width: 600px) {
    .condensed-col-image, .condensed-col-organization {
        display: none;
    }

    .condensed-col {
        width: 25%;
    }

    .condensed-col-title {
        width: 50%;
    }
}

</style>
