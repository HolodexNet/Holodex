<template>
    <div class="d-flex flex-row mentions">
        <template v-for="channel in mentions.slice(0, 3)">
            <channel-img
                :key="channel.id"
                :channel="channel"
                :size="24"
                rounded
            />
        </template>
        <div v-if="mentions.length > 3" class="collapsed-mention-count">
            +{{ mentions.length - 1 }}
        </div>
    </div>
</template>

<script>
import ChannelImg from "./ChannelImg.vue";

export default {
    name: "ChannelMentions",
    components: { ChannelImg },
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
