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
  /** the playhead location of the video for this room in seconds */
  playhead: number;
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

  constructor() {
    this.rooms = new Map();
    this.roomState = new Map();
  }

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
    }
    if (!this.roomState.has(room)) {
      this.roomState.set(room, {
        completed: false,
        loading: false,
        playhead: 0,
      });
    }
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
          playhead: 0,
          ...this.roomState.get(room),
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
          playhead: 0,
        });
      });
  }

  // removeMessage(index) {
  //   this.chat.splice(index, 1);
  // }
}
