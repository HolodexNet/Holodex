/* eslint-disable camelcase */
export type Playlist = { id?: number; name: string; user_id: number | string; videos?: Object[] };
export type PlaylistListItem = { id?: number; name: string; user_id: number | string; videos?: string[] };
export type PlaylistList = [PlaylistListItem];
