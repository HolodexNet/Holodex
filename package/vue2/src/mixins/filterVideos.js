export default {
    methods: {
        filterVideos(v, {
            ignoreBlock = false,
            hideCollabs = false,
            hideIgnoredTopics = true,
            forOrg = "",
            hidePlaceholder = false,
        }) {
            const blockedChannels = this.$store.getters["settings/blockedChannelIDs"];
            const ignoredTopics = this.$store.getters["settings/ignoredTopics"];
            const favoriteChannels = this.$store.getters["favorites/favoriteChannelIDs"];
            const org = forOrg || this.$store.state.currentOrg.name;

            let keep = true;
            const channelId = v.channel_id || v.channel.id;

            if (!ignoreBlock) {
                keep &&= !blockedChannels.has(channelId);
            }

            if (hideCollabs) {
                keep &&= (v.channel.org === org) || favoriteChannels.has(channelId);
            }

            if (hideIgnoredTopics) {
                keep &&= !ignoredTopics.has(v.topic_id);
            }

            if (hidePlaceholder) {
                keep &&= v.type !== "placeholder";
            }

            return keep;
        },
    },
};
