export default {
    methods: {
        filterVideos(v, { ignoreBlock = false, hideCollabs = false, hideIgnoredTopics = true }) {
            const blockedChannels = this.$store.getters["settings/blockedChannelIDs"];
            const ignoredTopics = this.$store.getters["settings/ignoredTopics"];
            const favoriteChannels = this.$store.getters["favorites/favoriteChannelIDs"];

            let keep = true;
            const channelId = v.channel_id || v.channel.id;

            if (!ignoreBlock) {
                keep &&= !blockedChannels.has(channelId);
            }

            if (hideCollabs) {
                keep &&= favoriteChannels.has(channelId);
            }

            if (hideIgnoredTopics) {
                keep &&= !ignoredTopics.has(v.topic_id);
            }

            return keep;
        },
    },
};
