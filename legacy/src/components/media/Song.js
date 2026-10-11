/* eslint-disable camelcase */
export default class Song {
    constructor(
        channel_id,
        channel,
        video_id,
        name,
        start,
        end,
        itunesid,
        art,
        amUrl,
        available_at,
        original_artist,
        creator_id,
        approver_id,
    ) {
        this.channel_id = channel_id;
        this.channel = channel;
        this.video_id = video_id;
        this.name = name;
        this.start = start;
        this.end = end;
        this.itunesid = itunesid;
        this.art = art;
        this.amUrl = amUrl;
        this.available_at = available_at;
        this.original_artist = original_artist;
        this.creator_id = creator_id;
        this.approver_id = approver_id;
    }
}
