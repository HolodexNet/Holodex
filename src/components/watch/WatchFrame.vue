<template>
    <div>
        <div class="video" :class="{ 'video-fluid': fluid }">
            <slot name="youtube"></slot>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "WatchFrame",
    components: {},
    props: {
        video: {
            required: true,
        },
        fluid: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    methods: {},
};
</script>
<style>
.thumbnail {
    position: relative;
}

.thumbnail-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
}

.video {
    position: relative;
    padding-bottom: 56.25%;
    padding-bottom: min(56.25%, calc(100vh - 120px));
    width: 100%;
}

.video.video-fluid {
    padding-bottom: min(56.25%, calc(100vh - 36px));
    /* padding-bottom: min(56.25%, 100vh); */
}
.video > div > iframe {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>
