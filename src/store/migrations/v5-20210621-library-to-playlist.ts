import { IMigration } from "vuex-persistedstate-migrate";
import kvidb from "kv-idb";

export default <IMigration>{
    version: 5,
    // migrates library -->
    up: (state) => {
        try {
            const mergedPlaylist = state.playlist && state.playlist.active ? state.playlist.active.videos || [] : [];

            for (const property in state.library.savedVideos) {
                // yt video
                if (property.length === 11) {
                    mergedPlaylist.push(state.library.savedVideos[property]);
                }
            }

            try {
                const db = kvidb("watch-history");
                for (const property in state.library.watchedVideos) {
                    // yt video
                    if (property.length === 11) {
                        db.put(property, 1, (x, err) => {
                            console.log(x, err);
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            }

            // delete state.library;

            return {
                ...state,
                playlist: {
                    ...(state.playlist && state.playlist),
                    active: {
                        ...(state.playlist && state.playlist.active),
                        videos: mergedPlaylist,
                    },
                },
            };
        } catch (err) {
            console.error(err);
        }
        return state;
    },
};
