///<reference types="chrome"/>

export { };

declare global {
    interface Window {
        Twitch: any; // Twitch object for TLScriptEditor
        onYouTubeIframeAPIReady: any; // callback function?
        YT: any; // YT object for TL Script Editor

        currentTheme: string;
    }
}
