Holodex Placeholders
----

### Introduction:

Holodex Placeholder API is a special non-advertised API endpoint for second and third party services to communicate upcoming events into the Holodex Platform.

- Holodex only supports Youtube Videos, but frequently Hololive is now making lots of external events: watchalongs on Twitch, Space, Twitcast, to more rare but important events like VARK and Concerts. But a full solution to support external events with automated crawlers is too complicated.

- The solution should generalize to non-Hololive and be extensible as long as there is community interest in helping fellow fans.


### Types:
```ts
export enum PLACEHOLDER_TYPES {
  YT_STREAM = 'scheduled-yt-stream', 
  // example: Gawr Gura will probably have a youtube stream with this title/content 
  EXTERNAL_STREAM = 'external-stream', 
  // example: Pekora is having a watchalong on Twitch at this time.
  EVENT = 'event', 
  // example: A concert is happening for Watame... here's the link to buy tickets.
}

// Credits the user. See the PlaceholderCard.vue file in src/ how it's displayed.
export interface PlaceholderCredit {
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

// Important: Send this in the body of the POST request.
interface PlaceholderRequestBody {
  id: string | undefined; 
  // set the <id> field to UPDATE an existing Placeholder. Leave empty to create new placeholder.
  channel_id: string;
  title: PlaceholderTitlePayload;
  liveTime: Date;
  // ISO8601 format: see also https://stackoverflow.com/a/8405125
  duration: number | undefined;
  // set the duration (in seconds) if you know of its approximate duration OR it's currently LIVE. 
  // PLACEHOLDER_TYPES.EVENT / EXTERNAL_STREAM will go 'live' on Holodex while: liveTime < NOW() < liveTime+duration
  // PLACEHOLDER_TYPES.YT_STREAM will never go Live on Holodex, and disappear when liveTime < Now()
}
```

### Responses:

- A placeholder CREATION will fail if another placeholder is in the vicinity for that channel. Set an `id` to update the placeholder instead.

Failure: Invalid fields will cause a 400/500 with a error message.

Failure: when too close to another Placeholder, a failure object will be returned. You can use the returned object's `id` to perform an update instead.
```json
STATUS 200
{ error: 'Failed - Another Placeholder already exists here.', placeholder: {VIDEO OBJECT} }
```
Success: returns the video object created.
```json
STATUS 200
[{id: XYZ, ...}]
```

----

### Example:

```
POST https://holodex.net/api/v2/videos/placeholder

HEADERS: 
    X-APIKEY: <YOUR API KEY>
    CONTENT-TYPE: application/json

BODY:
{
   "channel_id":"UCqm3BQLlJfvkTsX_hvm0UmA",
   "title":{
      "name":"Watame Night Fever\u0021\u0021 in Zepp Tokyo",
      "jp_name":"わためぇ Night Fever\u0021\u0021 in Zepp Tokyo",
      "link":"https://watame1stlive.hololive.tv/",
      "thumbnail":"https://hololive.hololivepro.com/wp-content/uploads/2021/08/watame_event_wnf_img.png",
      "placeholderType":"event",
      "certainty":"certain",
      "credits":{
         "editor":{
            "name":"@Sphinxrave",
            "user":"4"
         }
      }
   },
   "liveTime":"2021-10-13T00:30:00.000Z",
   "duration":7200
}
```