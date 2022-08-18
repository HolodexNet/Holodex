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
            forOrg ||= this.$store.state.currentOrg.name;

            let keep = true;
            const channelId = v.channel_id || v.channel.id;
            const isFavoritedOrInOrg = v.channel.org === forOrg || favoriteChannels.has(channelId) || forOrg === "All Vtubers";

            if (!ignoreBlock) {
                keep &&= !blockedChannels.has(channelId);
            }

            if (!isFavoritedOrInOrg) {
                keep &&= !hideCollabs && !v.mentions?.every(
                    ({ id, org }) => blockedChannels.has(id) || (org !== forOrg && !favoriteChannels.has(id))
                );
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
