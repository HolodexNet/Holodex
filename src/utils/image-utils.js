export function channel_photo_resize(photo_url, size) {
    const split = photo_url.split("=s");
    return `${split[0]}=s${size}-c-k-c0x00ffffff-no-rj-mo`;
}
