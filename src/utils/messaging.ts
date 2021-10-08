import { companionExtensionId, HolodexPlusExtensionId, MESSAGE_TYPES } from "@/utils/consts";

export const sendTokenToExtension = (token: string | null): void => {
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(companionExtensionId, { message: MESSAGE_TYPES.TOKEN, token });
    }
};

export const sendFavoritesToExtension = (favorites: any[]): void => {
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(companionExtensionId, { message: MESSAGE_TYPES.FAVORITES, favorites });
    }
};

export const likeRequest = (videoId: string): void => {
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(HolodexPlusExtensionId, { message: MESSAGE_TYPES.LIKEREQUEST, videoId });
    }
};
