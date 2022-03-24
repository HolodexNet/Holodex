import { companionExtensionId, MESSAGE_TYPES } from "@/utils/consts";
import jwtDecode from "jwt-decode";

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

export const setCookieJWT = (jwt: string) => {
    const { exp } = jwtDecode(jwt) as any;
    document.cookie = `HOLODEX_JWT=${jwt};expires=${(new Date(exp * 1000)).toUTCString()};domain=.holodex.net;path=/`;
};
