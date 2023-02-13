/**------------------------------------------------------------------------------------------------
 * *                                    Icons container
 *
 *   Importing the most commonly used mdi/js icons.
 *------------------------------------------------------------------------------------------------* */
// branding
export const youtube = "i-carbon:logo-youtube";
export const google = "i-carbon:logo-google";
export const twitter = "i-carbon:logo-twitter";
export const discord = "i-carbon:logo-discord";

// channels
export const videos = "i-fluent:video-20-regular";
export const collabs = "i-fluent:people-20-regular";
export const clips = "i-fluent:movies-and-tv-20-regular";
export const music = "i-fluent:music-note-2-play-20-filled";
export const about = "i-fluent:book-information-20-regular";

// features
export const gcal = "i-fluent:calendar-add-20-regular";
export const playlist = "i-material-symbols:playlist-play-rounded";

// functional
export const more = "i-ic:baseline-more-vert";
export const edit = "i-fluent:edit-20-filled";
export const listPlus = "i-tabler:playlist-add";
export const trash = "i-bx:trash";
// positional
export const up = "i-bx:chevron-up";
export const down = "i-bx:chevron-down";
export const check = "i-mdi:check";
export const plusBox = "i-mdi:plus-box";

export const schedule = "i-material-symbols:auto-schedule-rounded";
export const ytEvent = "i-material-symbols:youtube-activity";
export const event = "i-mdi:broadcast";
export const twitch = "i-mdi:twitch";
// export const twitter = "i-mdi:twitter"
export const instagram = "i-mdi:instagram";
export const niconico = "i-simple-icons:niconico";

export const sidebar_home = "i-material-symbols:home-storage-rounded";
export const sidebar_fave = "i-material-symbols:favorite-rounded";
export const sidebar_chan = "i-ion:people";
export const sidebar_play = "i-material-symbols:playlist-play-rounded";
export const sidebar_mult = "i-clarity:grid-chart-solid";
export const sidebar_mus = "i-mdi:music-clef-treble";
export const sidebar_set = "i-material-symbols:settings-rounded";
export const sidebar_info = "i-ion:information-circle-outline";
export const sidebar_tld = "i-bi:terminal";
export const sidebar_edit = "i-uil:file-edit-alt";
export const sidebar_manager = "i-mdi:file-arrow-up-down";
export const sidebar_relaybot = "i-mdi:robot-industrial";

/**
 * Search specific dropdown icons
 *
 * note that exporting like this requires special treatment in `vite.config.js`
 */
export const search: Record<string, string> = {
  org: "i-fluent:box-16-regular", // AND'd
  from: "i-ion:calendar-outline", //ms epoch or SerializedDate
  to: "i-ion:calendar-outline", //ms epoch or SerializedDate
  // uploader_id: 'i-fluent:id-button',
  search: "i-fluent:text-case-title-20-filled",
  title: "i-fluent:text-case-title-20-filled",
  description: "i-fluent:text-description-20-filled",
  type: "i-fluent:filter-20-filled",
  topic: "i-fluent:tag-multiple-16-regular", // OR'd.
  vtuber: "i-ion:people-outline", //id of vtubers.
  channel: "i-ion:people-outline",
  lang: "i-ion:language-outline",
  has_song: "i-fluent:music-note-2-20-regular",
  advanced: "i-fluent:database-search-20-regular",
};

// TODO: fix this??
export const ytChat =
  "M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2zM9.9,10.8v3.8h-2v-3.8L5.1,6.6h2.4l1.4,2.2 l1.4-2.2h2.4L9.9,10.8zM18.9,8.6h-2v6h-2v-6h-2v-2h6V8.6z";
export const tlChat =
  "M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M4,10h4v2H4V10zM14,16H4v-2h10V16z M20,16h-4v-2 h4V16z M20,12H10v-2h10V12z";
