import { SupportedLangCodes } from "@/hooks/i18n/i18nConsts";
import {
  VIDEO_URL_REGEX,
  TWITCH_VIDEO_URL_REGEX,
  TL_LANGS,
  TLLanguageCode,
  /*
    TWITCH_UNLIVE_VIDEO_URL_REGEX,
    TWITCAST_VIDEO_URL_REGEX,
    TWITCAST_UNLIVE_VIDEO_URL_REGEX,
    NICONICO_VIDEO_URL_REGEX,
    NICONICO_UNLIVE_VIDEO_URL_REGEX,
    BILIBILI_VIDEO_URL_REGEX,
    BILIBILI_UNLIVE_VIDEO_URL_REGEX,
    */
} from "@/utils/consts";

export function resizeArtwork(artworkUrl, size = 400) {
  // https://is5-ssl.mzstatic.com/image/thumb/Music125/v4/9c/39/27/9c392780-3f34-d322-9dde-002618154f40/source/400x400bb.jpg
  const adjustedSize = Math.floor(window.devicePixelRatio * size);
  const match =
    /^https:\/\/(.+?)\.mzstatic\.com\/image\/thumb\/(.+?)\/source\//.exec(
      artworkUrl
    );
  if (!match) return artworkUrl;
  const serv = match[1];
  const thumb = match[2];
  return `https://${serv}.mzstatic.com/image/thumb/${thumb}/source/${adjustedSize}x${adjustedSize}bb.jpg`;
}

export function resizeChannelPhoto(photoUrl, size) {
  const deviceSize = size; /* * window.devicePixelRatio */
  const split = photoUrl.split("=s");
  // try to hit cache by using a common size
  let adjSize = 48;
  if (deviceSize < 88 && deviceSize > 55) adjSize = 88;
  else if (deviceSize <= 55) adjSize = 48;
  else adjSize = 176;
  return `${split[0]}=s${adjSize}-c-k-c0x00ffffff-no-rj-mo`;
}

export function getChannelPhoto(channelId, size: string | number = 100) {
  const nearest = Math.min(Math.max(Math.ceil(+size / 50) * 50, 50), 150);
  return `/statics/channelImg/${channelId}/${nearest}.png`;
}

export function getVideoThumbnails(ytVideoKey, useWebP) {
  const base = useWebP
    ? "https://i.ytimg.com/vi_webp"
    : "https://i.ytimg.com/vi";
  const ext = useWebP ? "webp" : "jpg";
  return {
    // 120w
    default: `${base}/${ytVideoKey}/default.${ext}`,
    // 320w
    medium: `${base}/${ytVideoKey}/mqdefault.${ext}`,
    // 640w
    standard: `${base}/${ytVideoKey}/sddefault.${ext}`,
    // 1280w
    maxres: `${base}/${ytVideoKey}/maxresdefault.${ext}`,
    hq720: `${base}/${ytVideoKey}/hq720.${ext}`,
  };
}

// export function getUILang(weblang) {
//     const validLangs = new Set(langs.map((x) => x.val));
//     if (validLangs.has(String(weblang))) {
//         return String(weblang);
//     }
//     if (validLangs.has(String(weblang).split("-")[0].toLowerCase())) {
//         return String(weblang).split("-")[0].toLowerCase();
//     }
//     return "en";
// }

/**
 * guesses which clipper language is best for a UI language.
 * @param weblang current UI language
 * @returns TL Lang preference.
 */
export function getTLLangRecommendation(
  weblang: SupportedLangCodes
): TLLanguageCode {
  const Langs = new Set(TL_LANGS.map((x) => x.value));
  const lang = String(weblang).split("-")[0].toLowerCase();
  if (Langs.has(lang as any)) {
    return lang as TLLanguageCode;
  }
  return "en";
}

export function getBannerImages(url) {
  const base = `${url.split("=")[0]}=`;
  return {
    tablet: `${base}w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
    mobile: `${base}w960-fcrop64=1,32b75a57cd48a5a8-k-c0xffffffff-no-nd-rj`,
    // bannerTabletLowImageUrl:
    //     "w1138-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj",
    banner: `${base}w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
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
    tv: `${base}w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`,
    // bannerTvLowImageUrl:
    //     "w854-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
    // bannerTvMediumImageUrl:
    //     "w1280-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
    // bannerTvHighImageUrl:
    //     "w1920-fcrop64=1,00000000ffffffff-k-c0xffffffff-no-nd-rj",
  };
}

const formatters = {};
const numberFormatAdjust = {
  "lol-UWU": "en",
  "lol-PEKO": "en",
};

export function formatCount(n, lang = "en") {
  const converted = numberFormatAdjust[lang] ?? lang;
  if (!formatters[converted]) {
    formatters[converted] = new Intl.NumberFormat(converted, {
      compactDisplay: "short",
      notation: "compact",
      maximumSignificantDigits: 3,
    });
  }
  let num = n;
  if (typeof n === "string") num = +n;
  return formatters[converted].format(num);
}

export function decodeHTMLEntities(str) {
  return str.split("&amp;").join("&").split("&quot;").join('"');
}

export function forwardTransformSearchToAPIQuery(obj, initialObject) {
  return obj.reduceRight((req, item) => {
    switch (item.type) {
      case "title & desc":
        req.conditions.push({
          text: item.text.trim(),
        });
        break;
      case "comments":
        req.comment = [item.text.trim()];
        break;
      case "channel":
        req.vch.push(item.value);
        break;
      case "topic":
        req.topic.push(item.value);
        break;
      case "org":
        req.org.push(item.value);
        break;
      default:
        break;
    }
    return req;
  }, initialObject);
}

export function localSortChannels(channels, { sort, order = "asc" }) {
  if (!sort) return channels;
  channels.sort((a, b) => {
    // if (sort === "latest_published_at") {
    //     const dateA = new Date(a[sort]).getTime();
    //     const dateB = new Date(b[sort]).getTime();
    //     return dateA > dateB ? 1 : -1;
    // }
    if (sort === "video_count" || sort === "subscriber_count") {
      return Number(a[sort]) > Number(b[sort]) ? 1 : -1;
    }
    return a[sort] > b[sort] ? 1 : -1;
  });
  if (order === "desc") channels.reverse();
  return channels;
}

export function arrayChunk(arr, size) {
  return Array.from(new Array(Math.ceil(arr.length / size)), (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function videoTemporalComparator(a, b) {
  if (a.available_at === b.available_at) {
    return a.id.localeCompare(b.id);
  }
  const dateA = new Date(a.available_at).getTime();
  const dateB = new Date(b.available_at).getTime();
  return dateA - dateB;
}

/**
 * Returns a layout content object by parsing URL
 * @param {String} url - A video url
 * @returns {Object}
 */
export function getVideoIDFromUrl(url: string) {
  if (VIDEO_URL_REGEX.test(url)) {
    const match = url.match(VIDEO_URL_REGEX);
    if (match && match[5] && match[5].length === 11) {
      return {
        id: match[5],
        type: "yt",
        custom: true,
        channel: {
          name: match[5],
        },
      };
    }
  }
  /*
    if (TWITCH_UNLIVE_VIDEO_URL_REGEX.test(url)) {
        const match = url.match(TWITCH_UNLIVE_VIDEO_URL_REGEX);
        if (match && match[1]) {
            return {
                id: match[1],
                type: "twitch_vod",
                custom: true,
            };
        }
    }
    */
  if (TWITCH_VIDEO_URL_REGEX.test(url)) {
    const match = url.match(TWITCH_VIDEO_URL_REGEX);
    if (match && match[1]) {
      return {
        id: match[1],
        type: "twitch",
        custom: true,
        channel: {
          name: match[1],
        },
      };
    }
  }
  /*
    if (TWITCAST_UNLIVE_VIDEO_URL_REGEX.test(url)) {
        const match = url.match(TWITCAST_UNLIVE_VIDEO_URL_REGEX);
        if (match && match[1] && match[2]) {
            return {
                id: match[2],
                type: "twitcast_vod",
                custom: true,
                channel: {
                    name: match[1],
                },
            };
        }
    }
    if (TWITCAST_VIDEO_URL_REGEX.test(url)) {
        const match = url.match(TWITCAST_VIDEO_URL_REGEX);
        if (match && match[1]) {
            return {
                id: match[1],
                type: "twitcast",
                custom: true,
                channel: {
                    name: match[1],
                },
            };
        }
    }
    if (NICONICO_VIDEO_URL_REGEX.test(url)) {
        const match = url.match(NICONICO_VIDEO_URL_REGEX);
        if (match && match[1]) {
            return {
                id: match[1],
                type: "niconico",
                custom: true,
                channel: {
                    name: match[1],
                },
            };
        }
    }
    if (NICONICO_UNLIVE_VIDEO_URL_REGEX.test(url)) {
        const match = url.match(NICONICO_UNLIVE_VIDEO_URL_REGEX);
        if (match && match[1]) {
            return {
                id: match[1],
                type: "niconico_vod",
                custom: true,
            };
        }
    }
    if (BILIBILI_VIDEO_URL_REGEX.test(url)) {
        const match = url.match(BILIBILI_VIDEO_URL_REGEX);
        if (match && match[1]) {
            return {
                id: match[1],
                type: "bilibili",
                custom: true,
                channel: {
                    name: match[1],
                },
            };
        }
    }
    if (BILIBILI_UNLIVE_VIDEO_URL_REGEX.test(url)) {
        const match = url.match(BILIBILI_UNLIVE_VIDEO_URL_REGEX);
        if (match && match[1]) {
            return {
                id: match[1],
                type: "bilibili_vod",
                custom: true,
            };
        }
    }
    */

  return undefined;
}

export function videoCodeParser(videoCode: string) {
  switch (videoCode.slice(0, 3)) {
    case "YT_":
      return `https://www.youtube.com/watch?v=${videoCode.slice(3)}`;

    default:
      return videoCode;
  }
}

export function checkIOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

// Wait for element is deprecated, use vue-use's `useMutationObserver` instead
// https://vueuse.org/core/useMutationObserver/

// export function waitForElement(selector) {
//     return new Promise((resolve) => {
//         if (document.querySelector(selector)) {
//             resolve(document.querySelector(selector));
//             return;
//         }
//         const observer = new MutationObserver(() => {
//             if (document.querySelector(selector)) {
//                 resolve(document.querySelector(selector));
//                 observer.disconnect();
//             }
//         });
//         observer.observe(document.body, {
//             childList: true,
//             subtree: true,
//         });
//     });
// }
