<template>
    <div class="d-flex flex-row mentions">
        <template v-for="channel in mentions.slice(0, 3)">
            <channel-img :channel="channel" :key="channel.id" :size="24" rounded />
        </template>
        <div class="collapsed-mention-count" v-if="mentions.length > 3">+{{ mentions.length - 1 }}</div>
    </div>
</template>

<script>
import ChannelImg from "./ChannelImg.vue";

export default {
    components: { ChannelImg },
    name: "ChannelMentions",
    props: {
        mentions: {
            type: Array,
            required: true,
        },
    },
};
</script>

<style>
.mentions > * {
    border: 2px var(--v-background-base) solid;
    box-sizing: border-box;
    border-radius: 50%;
}

.mentions > *:not(:first-child) {
    margin-left: -10px;
}

.collapsed-mention-count {
    width: 28px;
    height: 28px;
    background-color: var(--v-background-lighten2);
    border-radius: 50%;
    text-align: center;
    font-size: 14px;
    line-height: 1.45rem;
}
</style>
