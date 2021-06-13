import { Playlist } from "@/utils/types";

const initialState = {
    active: {
        id: undefined,
        name: "Unnamed Playlist",
        videos: [],
    },
    saved: false,
};

const mutations = {
    saved(state) {
        state.saved = true;
    },
    modified(state) {
        state.saved = false;
    },
    reorder(state, oldIndex: number, newIndex: number) {},
    delete(state, index: number) {},
    deleteVideo(state, videoId: string) {},
};

const actions = {
    saveActivePlaylist(state) {
        // save the playlist
        // remember the ID returned by the server inside active.id
        // optionally: refetch via ID just to make sure.
    },
    setActivePlaylistByID(state, playlistId: number) {},
    setActivePlaylist(state, playlist: Playlist) {},
    deleteActivePlaylist(state) {
        // can only be done if the active playlist has an ID
        // if not, just clear the current playlist.
    },
};
