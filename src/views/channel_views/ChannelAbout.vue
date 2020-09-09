<template>
    <div style="white-space: pre-wrap">
        {{ channel.description }}
    </div>
</template>

<script>
export default {
    name: "ChannelAbout",
    props: {
        channel: {
            required: true,
            type: Object,
        },
    },
};
</script>

<style></style>
