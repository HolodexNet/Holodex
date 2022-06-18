///<reference types="chrome"/>

export { };


declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
      icons: typeof import('./utils/icons');
    }
  }

declare global {
    interface Window {
        Twitch: any; // Twitch object for TLScriptEditor
        onYouTubeIframeAPIReady: any; // callback function?
        YT: any; // YT object for TL Script Editor

        currentTheme: string;
    }

    enum CHANNEL_TYPES {
        VTUBER = 'vtuber',
        SUBBER = 'subber',
    }
    enum VIDEO_TYPES {
        CLIP = 'clip',
        STREAM = 'stream',
        PLACEHOLDER = 'placeholder',
    }
    enum RELATIONSHIP_TYPES {
        REFER = 'refer',
        SIMULCAST = 'simulcast',
        CLIP = 'clip',
    }
    enum USER_ROLES {
        ADMIN = 'admin',
        EDITOR = 'editor',
        USER = 'user',
    }
    enum CHAT_SOURCES {
        YOUTUBE = 'youtube',
        MCHAD = 'MChad',
        USER = 'user',
    }
    enum VIDEO_STATUSES {
        NEW = 'new',
        LIVE = 'live',
        UPCOMING = 'upcoming',
        PAST = 'past',
        MISSING = 'missing',
    }

    interface VideoCore {
        id: string;
        channel_id?: string;
        title: string;
        description: string;
        duration?: number;
        status: VIDEO_STATUSES;
        type: VIDEO_TYPES;
        lang: string;
        published_at: Date;
        available_at: Date;
    }

    enum PLACEHOLDER_TYPES {
        YT_STREAM = 'scheduled-yt-stream',
        EXTERNAL_STREAM = 'external-stream',
        EVENT = 'event',
    }

    interface PlaceholderCredit {
        //Removed Temporarily img?: string;
        link?: string; // for discord this is the invite code.
        name?: string; // for discord this is the guild ID
        user?: string;
    }

    interface PlaceholderTitlePayload {
        name: string;
        jp_name: string;
        link: string;
        thumbnail: string;
        placeholderType: PLACEHOLDER_TYPES;
        certainty: 'certain' | 'likely';
        credits: {
            discord?: PlaceholderCredit;
            datasource?: PlaceholderCredit;
            bot?: PlaceholderCredit;
            editor?: PlaceholderCredit;
        };
    }

    interface VideoRef {
        id: string;
        lang: string;
        type: VIDEO_TYPES;
        title: string;
        status: VIDEO_STATUSES;
        channel: ShortChannel;
        available_at?: Date;
        duration?: number;
    }

    interface ShortChannel {
        id: string;
        name: string;
        type: CHANNEL_TYPES;
        english_name?: string;
        org?: string;
        group? :string; //group is likely not existent.
        lang?: string; // lang is sometimes missing.
        photo?: string;
    }

    type PrivacyStatus = 'public' | 'private';

    /**
     * available on the watch page and other places
     */
    interface VideoDetailed extends VideoRef {
        // id: string;
        // title: string;
        // duration?: number;
        // status: VIDEO_STATUSES;
        // type: VIDEO_TYPES;
        // lang: string;

        published_at?: Date;
        topic_id?: string;
        // if request DESCRIPTION
        description?: string;

        // usually present:
        songcount?: number;
        // usually present
        live_tl_count?: object;


        // views: number;
        // topic_approver_id?: number;
        // live_tl_count?: Record<string, number>;
        // is_uploaded?: Boolean;
        // is_captioned?: Boolean;
        // is_licensed?: Boolean;
        // is_embeddable?: Boolean;
        // privacy_status?: PrivacyStatus;
        // analyzed?: boolean;
    }

    /**
     * Various extensions that can be loaded into the video object.
     */
    interface ExtendedVideo extends VideoDetailed {

        // if request LIVE_INFO
        start_scheduled?: Date;
        // if request LIVE_INFO
        start_actual?: Date;
        // if request LIVE_INFO
        end_actual?: Date;
        // if request LIVE_INFO
        updated_at?: Date | number;
        // if request LIVE_INFO
        live_viewers?: number;
        // if request LIVE_INFO
        recent_live_tls?: Array<string>;

        // upon request the lower keys will be available
        clips?: Array<VideoRef>;
        sources?: Array<VideoRef>;
        simulcasts?: Array<VideoRef>;
        refers?: Array<VideoRef>;
        mentions?: Array<ShortChannel>;
        songs?: Array<Partial<Song>>;
    }

    export type Video = Omit<ExtendedVideo & Partial<PlaceholderTitlePayload>, 'name'>;


    interface Song {
        channel_id: string;
        video_id: string;
        name: string;
        start: number;
        end: number;
        itunesid: number | string;
        art: string;
        amUrl: string;
        available_at: Date;
        original_artist: string;
        creator_id: number;
        approver_id: number;
        is_mv: boolean;
        id: string;
        status: string;
    }

    interface FullChannel {
        id: string;
        name: string;
        english_name?: string;
        type: CHANNEL_TYPES;
        org?: string;
        suborg?: string;
        lang?: string;
        twitter?: string;
        photo?: string;
        thumbnail?: string;
        banner?: string;
        published_at?: Date;
        view_count?: string | number;
        video_count?: string | number;
        subscriber_count?: string | number;
        comments_crawled_at?: Date;
        updated_at?: Date;
        yt_uploads_id?: string;
        clip_count?: number;
        inactive?: boolean;
        created_at?: Date;
        top_topics?: string[];
        crawled_at?: Date;
    }


}
