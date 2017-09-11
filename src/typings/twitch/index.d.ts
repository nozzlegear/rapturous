declare module "twitch" {
    export interface Links {
        next?: string;
        self: string;
        last?: string;
        channel?: string;
    }

    export interface FollowsResponse {
        _links: Links;
        _total: number;
        follows: Follow[];
    }

    export interface Follow {
        created_at: string;
        _links: Links;
        notifications: boolean;
        channel: Channel;
    }

    export interface Channel {
        mature: boolean,
        status: string,
        broadcaster_language: string,
        display_name: string,
        game: string,
        delay: number;
        language: string,
        _id: number;
        name: string,
        created_at: string,
        updated_at: string,
        logo: string,
        banner: string,
        video_banner: string,
        background: string,
        profile_banner: string,
        profile_banner_background_color: string,
        partner: true,
        url: string,
        views: number;
        followers: number;
    }

    export interface StreamsResponse {
        _links: Links;
        _total: number;
        streams: Stream[];
    }

    export interface Stream {
        _links: Links;
        game: string,
        viewers: number,
        average_fps: number,
        delay: number,
        video_height: number,
        is_playlist: boolean,
        created_at: string,
        _id: number,
        channel: Channel;
        preview: StreamPreviews;
    }

    export interface StreamPreviews {
        small: string,
        medium: string,
        large: string,
        templat: string,
    }
}