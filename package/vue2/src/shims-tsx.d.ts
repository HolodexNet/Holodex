import Vue, { VNode } from "vue";

declare global {
    namespace JSX {
        // tslint:disable no-empty-interface
        interface Element extends VNode { }
        // tslint:disable no-empty-interface
        interface ElementClass extends Vue { }
        interface IntrinsicElements {
            [elem: string]: any;
        }
    }
    interface Window {
        Twitch: any; // Twitch object for TLScriptEditor
        onYouTubeIframeAPIReady: any; // callback function?
        YT: any // YT object for TL Script Editor
    }

}
