/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  ParsedMessage,
  TLDexMessage,
  toParsedMessage,
} from "@/stores/socket_types";
import { TLDexStoreState } from "@/stores/tldex";
import backendApi from "@/utils/backend-api";
import { TLLanguageCode } from "@/utils/consts";
import sorted from "sorted-array-functions";

export type RoomIDString = `${string}/${TLLanguageCode}`;

interface RoomState {
  /** whether or not a room has finished loading all archived chat content*/
  completed: boolean;
  /**whether or not a room is currently loading some content */
  loading: boolean;
}

/**
 * Defines APIs for dealing with multiple chat rooms

 * https://stackoverflow.com/a/69050924 (for understanding how to use classes)

 */
export class ChatDB {
  /** Tracks the chat messages in each room */
  rooms: Map<RoomIDString, Array<ParsedMessage>>;
  /** Tracks the loading state of history for each room. */
  roomState: Map<RoomIDString, RoomState>;
  /** where each video's elapsed timers are at */
  playheads: Map<string, { elapsed: number; absolute: number }>;
  videoToRoomMap: Map<string, Set<RoomIDString>>;

  constructor() {
    this.rooms = new Map();
    this.roomState = new Map();
    this.playheads = new Map();

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
      if (sortedMessageList[i - 1].key == sortedMessageList[i].key) {
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
      this.rooms.get(room) as ParsedMessage[],
      message,
      ChatDB.ParsedMessageComparator
    );
    if (!ChatDB.checkArrayIsUnique(this.rooms.get(room) as ParsedMessage[])) {
      this.rooms.set(
        room,
        ChatDB.distinctSortedArray(this.rooms.get(room) as ParsedMessage[])
      );
    }
  }

  /**
   * Optimized method for adding many messages to a chatroom.
   * @param room the room to add the message to
   * @param message the messages to add.
   */
  addMessages(room: RoomIDString, messages: ParsedMessage[]) {
    this.createRoomStateIfNotExists(room);
    this.rooms.get(room)?.push(...messages);
    this.rooms.get(room)?.sort(ChatDB.ParsedMessageComparator);
    if (!ChatDB.checkArrayIsUnique(this.rooms.get(room) as ParsedMessage[])) {
      this.rooms.set(
        room,
        ChatDB.distinctSortedArray(this.rooms.get(room) as ParsedMessage[])
      );
    }
  }

  createRoomStateIfNotExists(room: RoomIDString) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, []);
      const videoId = room.split("/")[0];
      this.videoToRoomMap.set(
        videoId,
        new Set([room, ...(this.videoToRoomMap.get(videoId)?.values() ?? [])])
      );
    }
    if (!this.roomState.has(room)) {
      this.roomState.set(room, {
        completed: false,
        loading: false,
      });
    }
  }

  /**
   * Updates the current offset of a video,
   * @param video_id
   * @param elapsed elapsed time in seconds
   * @param absolute the elapsed time + available_at time
   */
  updateRoomElapsed(video_id: string, elapsed: number, absolute: number) {
    const now = { elapsed, absolute };
    this.playheads.set(video_id, now);
    this.videoToRoomMap.get(video_id)?.forEach((room) => {
      this.rooms.get(room)?.forEach((message) => {
        if (message.videoOffset) {
          if (
            message.videoOffset > elapsed &&
            message.videoOffset +
              (message.duration || message.message.length * 65 + 1800) <=
              elapsed
          ) {
            message.is_current = true;
          } else if (message.is_current) {
            message.is_current = false;
          }
        } else {
          if (
            +message.timestamp > absolute &&
            +message.timestamp +
              (message.duration || message.message.length * 65 + 1800) <=
              absolute
          ) {
            message.is_current = true;
          } else if (message.is_current) {
            message.is_current = false;
          }
        }
      });
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
    this.createRoomStateIfNotExists(room);
    if (this.roomState.get(room)!.loading) return;

    const countToLoad = partial || 10000;
    const prior = this.rooms.get(room)?.[0]?.timestamp;

    const videoId = room.split("/")[0];

    const query = {
      lang: room.split("/")[1],
      verified: preferences.liveTlShowVerified,
      moderator: preferences.liveTlShowModerator,
      vtuber: preferences.liveTlShowVtuber,
      limit: countToLoad,
      ...(prior && { before: prior }),
    };

    this.roomState.get(room)!.loading = true;
    backendApi
      .chatHistory(videoId, query)
      .then(({ data }: { data: TLDexMessage[] }) => {
        this.roomState.set(room, {
          completed: data.length !== countToLoad,
          loading: false,
        });
        this.addMessages(
          room,
          data.map((x) => toParsedMessage(x))
        );
      })
      .catch((e) => {
        console.error(e);
        this.roomState.set(room, {
          completed: false,
          loading: false,
        });
      });
  }

  // removeMessage(index) {
  //   this.chat.splice(index, 1);
  // }
}
