export default {
    methods: {
        filterVideos(v, {
            ignoreBlock = false,
            hideCollabs = false,
            hideIgnoredTopics = true,
            forOrg = "",
            hidePlaceholder = false,
            hideMissing = false,
            hideGroups = false,
        }) {
            const blockedChannels = this.$store.getters["settings/blockedChannelIDs"];
            const ignoredTopics = this.$store.getters["settings/ignoredTopics"];
            const favoriteChannels = this.$store.getters["favorites/favoriteChannelIDs"];
            // eslint-disable-next-line no-param-reassign
            forOrg ||= this.$store.state.currentOrg.name;
            const { hiddenGroups } = this.$store.state.settings;
            const validOrgs = Object.keys(hiddenGroups);
            const orgGroupsHidden = validOrgs.includes(v.channel.org);

            let keep = true;
            const channelId = v.channel_id || v.channel.id;
            const isFavoritedOrInOrg = v.channel.org === forOrg || favoriteChannels.has(channelId) || forOrg === "All Vtubers";
            const channelGroup = (v.channel.group || (`${v.channel.suborg}`).slice(2) || "Other").toLowerCase();
            let hideViaGroup = false;
            if (orgGroupsHidden) hideViaGroup = hiddenGroups[v.channel.org].includes(channelGroup);

            if (!ignoreBlock) {
                keep &&= !blockedChannels.has(channelId);
            }

            // TODO: Update to suport hideViaGroup: mentions needs suborg field on API
            if (!isFavoritedOrInOrg) {
                keep &&= !hideCollabs && !v.mentions?.every(
                    ({ id, org, suborg }) => (blockedChannels.has(id)
                    || (hideGroups && validOrgs.includes(org) && hiddenGroups[org].includes((`${suborg}`).slice(2) || "Other"))
                    || (org !== forOrg && !favoriteChannels.has(id))),
                );
            }

            if (hideIgnoredTopics) {
                keep &&= !ignoredTopics.has(v.topic_id);
            }

            if (hidePlaceholder) {
                keep &&= v.type !== "placeholder";
            }

            if (hideMissing) {
                keep &&= v.status !== "missing";
            }

            if (hideGroups) {
                if (orgGroupsHidden) {
                    keep &&= !hideViaGroup;
                }
            }

            return keep;
        },
    },
};
