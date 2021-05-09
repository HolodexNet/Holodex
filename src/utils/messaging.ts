import { companionExtensionId, MESSAGE_TYPES } from "@/utils/consts";

export const sendTokenToExtension = (token: string | null): void => {
    // @ts-ignore
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        // @ts-ignore
        chrome.runtime.sendMessage(companionExtensionId, { message: MESSAGE_TYPES.TOKEN, token });
    }
};

export const sendFavoritesToExtension = (favorites: any[]): void => {
    // @ts-ignore
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        // @ts-ignore
        chrome.runtime.sendMessage(companionExtensionId, { message: MESSAGE_TYPES.FAVORITES, favorites });
    }
};
