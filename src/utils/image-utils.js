export function channel_photo_resize(photo_url, size) {
    const split = photo_url.split("=s");
    return `${split[0]}=s${size}-c-k-c0x00ffffff-no-rj-mo`;
}

export function video_thumbnail_array(yt_video_key, type = "jpg") {
    const base =
        type === "webp"
            ? "https://i.ytimg.com/vi_webp"
            : "https://i.ytimg.com/vi";
    return {
        //120w
        default: `${base}/${yt_video_key}/default.jpg`,
        //320w
        medium: `${base}/${yt_video_key}/mqdefault.jpg`,
        // 640w
        standard: `${base}/${yt_video_key}/sddefault.jpg`,
        // 1280w
        maxres: `${base}/${yt_video_key}/maxresdefault.jpg`,
        hq720: `${base}/${yt_video_key}/hq720.jpg`,
    };
}
