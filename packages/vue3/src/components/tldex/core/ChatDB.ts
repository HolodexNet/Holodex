/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ParsedMessage,
  RoomIDString,
  TLDexMessage,
  roomToLang,
  roomToVideoID,
  toParsedMessage,
} from "@/stores/socket_types";
import { TLDexStoreState } from "@/stores/tldex";
import backendApi from "@/utils/backend-api";
import sorted from "sorted-array-functions";

interface RoomState {
  /** whether or not a room has finished loading all archived chat content*/
  completed: boolean;
  /**whether or not a room is currently loading some content */
  loading: boolean;
}

interface RoomInfo {
  messages: Array<ParsedMessage>;
  /** Tracks the loading state of history */
  state: RoomState;
  /** playhead location */
  elapsed: number;
  /** absolute second epoch of video player @ location */
  absolute: number;
}

/**
 * Determines if a message is currently visible based on the elapsed time or the absolute timestamp.
 *
 * @param {ParsedMessage} message - The parsed message to check.
 * @param {number} [elapsed] - The elapsed time in seconds.
 * @param {number} [absolute] - The absolute timestamp in seconds.
 * @return {boolean} - `true` if the message is currently visible, `false` otherwise.
 */
export function isMessageCurrent(
  message: ParsedMessage,
  elapsed?: number,
  absolute?: number
): boolean {
  const duration =
    (message.duration || message.message.length * 65 + 1800) / 1000;

  if (message.video_offset && elapsed) {
    return (
      message.video_offset < elapsed &&
      elapsed <= message.video_offset + duration
    );
  } else if (absolute) {
    const timestamp = +message.timestamp / 1000;
    return timestamp < absolute && absolute <= timestamp + duration;
  }
  return false;
}

/**
 * Defines APIs for dealing with multiple chat rooms

 * https://stackoverflow.com/a/69050924 (for understanding how to use classes)

 */
export class ChatDB {
  /** Tracks the chat messages in each room */
  rooms: Map<RoomIDString, RoomInfo>;
  videoToRoomMap: Map<string, Set<RoomIDString>>;

  constructor() {
    this.rooms = new Map();

    this.videoToRoomMap = new Map();
  }

  /**
   * Check if an array of ParsedMessage objects is unique based on their key field.
   *
   * @param {ParsedMessage[]} sortedMessageList - An array of ParsedMessage objects sorted by key.
   * @return {boolean} Returns true if the array is unique, false otherwise.
   */
  private static checkArrayIsUnique(sortedMessageList: ParsedMessage[]) {
    for (let i = 1; i < sortedMessageList.length; i++) {
      if (
        sortedMessageList[i - 1].key == sortedMessageList[i].key ||
        (sortedMessageList[i - 1].id || 0) == (sortedMessageList[i].id || 1)
      ) {
        return false;
      }
    }
    return true;
  }

  private static distinctSortedArray(sortedArray: ParsedMessage[]) {
    if (sortedArray.length === 0) return sortedArray;
    const ret = [sortedArray[0]];
    for (let i = 1; i < sortedArray.length; i++) {
      //Start loop at 1: sortedArray[0] can never be a duplicate
      if (sortedArray[i - 1].key !== sortedArray[i].key) {
        ret.push(sortedArray[i]);
      }
    }
    return ret;
  }

  /**
   * Compares two ParsedMessage objects based on their timestamps.
   *
   * @param {ParsedMessage} a - The first ParsedMessage to compare.
   * @param {ParsedMessage} b - The second ParsedMessage to compare.
   * @return {number} Returns 1 if a is greater than b, -1 if a is less than b,
   * and 0 if a and b are equal.
   */
  static ParsedMessageComparator(a: ParsedMessage, b: ParsedMessage) {
    if (a.timestamp > b.timestamp) return 1;
    if (a.timestamp < b.timestamp) return -1;
    return 0;
  }

  /**
   * Optimized method for adding message to a chatroom.
   * @param room the room to add the message to
   * @param message the message content.
   */
  addMessage(room: RoomIDString, message: ParsedMessage) {
    this.createRoomStateIfNotExists(room);
    sorted.add(
      this.rooms.get(room)!.messages as ParsedMessage[],
      message,
      ChatDB.ParsedMessageComparator
    );
    // if (!ChatDB.checkArrayIsUnique(this.rooms.get(room) as ParsedMessage[])) {
    //   this.rooms.set(
    //     room,
    //     ChatDB.distinctSortedArray(this.rooms.get(room) as ParsedMessage[])
    //   );
    // }
  }

  /**
   * Optimized method for adding many messages to a chatroom.
   * @param room the room to add the message to
   * @param message the messages to add.
   */
  addMessages(room: RoomIDString, messages: ParsedMessage[]) {
    this.createRoomStateIfNotExists(room);
    this.rooms.get(room)!.messages.push(...messages);
    this.rooms.get(room)!.messages.sort(ChatDB.ParsedMessageComparator);
    // if (!ChatDB.checkArrayIsUnique(this.rooms.get(room) as ParsedMessage[])) {
    //   this.rooms.set(
    //     room,
    //     ChatDB.distinctSortedArray(this.rooms.get(room) as ParsedMessage[])
    //   );
    // }
  }

  createRoomStateIfNotExists(room: RoomIDString) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, {
        messages: [],
        state: { completed: false, loading: false },
        elapsed: 0,
        absolute: 0,
      });
      const videoId = roomToVideoID(room);
      this.videoToRoomMap.set(
        videoId,
        new Set([room, ...(this.videoToRoomMap.get(videoId)?.values() ?? [])])
      );
    }
  }

  /**
   * Updates the current offset of a video,
   * @param video_id
   * @param elapsed elapsed time in seconds
   * @param absolute the elapsed time + available_at time
   */
  updateRoomElapsed(video_id: string, elapsed: number, absolute: number) {
    // const now = { elapsed, absolute };
    this.videoToRoomMap.get(video_id)?.forEach((room) => {
      // console.log(room);
      this.rooms.get(room)!.elapsed = elapsed;
      this.rooms.get(room)!.absolute = absolute;
    });
  }

  /**
   *
   * @param room which room to load message from
   * @param preferences TLdex preferences
   * @param partial how many to load if partially loading.
   */
  loadMessages(
    room: RoomIDString,
    preferences: TLDexStoreState,
    partial?: number
  ) {
    console.log("[Load message] room:", room, "partial:", partial);
    this.createRoomStateIfNotExists(room);
    if (this.rooms.get(room)!.state.loading) return;

    const countToLoad = partial || 10000;
    const prior = this.rooms.get(room)?.messages?.[0]?.timestamp;

    const videoId = roomToVideoID(room);

    const query = {
      lang: roomToLang(room),
      verified: preferences.liveTlShowVerified,
      moderator: preferences.liveTlShowModerator,
      vtuber: preferences.liveTlShowVtuber,
      limit: countToLoad,
      ...(prior && { before: prior }),
    };

    this.rooms.get(room)!.state.loading = true;
    backendApi
      .chatHistory(videoId, query)
      .then(({ data }: { data: TLDexMessage[] }) => {
        this.addMessages(
          room,
          data.map((x) => toParsedMessage(x, videoId))
        );
        this.rooms.get(room)!.state = {
          completed: data.length !== countToLoad,
          loading: false,
        };
      })
      .catch((e) => {
        console.error(e);
        this.rooms.get(room)!.state = {
          completed: false,
          loading: false,
        };
      });
  }

  // removeMessage(index) {
  //   this.chat.splice(index, 1);
  // }
}
