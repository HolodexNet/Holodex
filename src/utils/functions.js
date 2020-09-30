export function channel_photo_resize(photo_url, size) {
    const split = photo_url.split("=s");
    return `${split[0]}=s${size}-c-k-c0x00ffffff-no-rj-mo`;
}

export function video_thumbnails(yt_video_key, useWebP) {
    const base = useWebP
        ? "https://i.ytimg.com/vi_webp"
        : "https://i.ytimg.com/vi";
    const ext = useWebP ? "webp" : "jpg";
    return {
        //120w
        default: `${base}/${yt_video_key}/default.${ext}`,
        //320w
        medium: `${base}/${yt_video_key}/mqdefault.${ext}`,
        // 640w
        standard: `${base}/${yt_video_key}/sddefault.${ext}`,
        // 1280w
        maxres: `${base}/${yt_video_key}/maxresdefault.${ext}`,
        hq720: `${base}/${yt_video_key}/hq720.${ext}`,
    };
}

export function banner_images(url) {
    const base = url.split("=")[0] + "=";
    return {
        banner:
            base + "w1060-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
        mobile: base + "w640-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
        // bannerTabletLowImageUrl:
        //     "w1138-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
        tablet:
            base + "w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
        // bannerTabletHdImageUrl:
        //     "w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
        // bannerTabletExtraHdImageUrl:
        //     "w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
        // bannerMobileLowImageUrl:
        //     "w320-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
        // bannerMobileMediumHdImageUrl:
        //     "w960-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
        // bannerMobileHdImageUrl:
        //     "w1280-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
        // bannerMobileExtraHdImageUrl:
        //     "w1440-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj",
        tv: base + "w2120-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
        // bannerTvLowImageUrl:
        //     "w854-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
        // bannerTvMediumImageUrl:
        //     "w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
        // bannerTvHighImageUrl:
        //     "w1920-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
    };
}

export function formatCount(subs) {
    if (subs >= 1000000) return (subs / 1000000).toFixed(1) + "M";
    if (subs >= 1000) return Math.round(subs / 1000) + "K";
    else return subs;
}

export function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
