export interface Entry {
  id: number;
  Time: number;
  Duration: number;
  SText: string;
  Profile: number;
}

export interface Profile {
  Name: string;
  Prefix: string;
  Suffix: string;
  useCC: boolean;
  CC: string; // hex color
  useOC: boolean;
  OC: string; //hex color
}

/**
  Delete
  data: id

  Add
  data: lang, tempid, name,timestamp, message, duration

  Change
  data: lang, id, name,timestamp, message, duration

 */
export interface TransactionLogItem {
  type: "Add" | "Delete" | "Change";
  data?: {
    id?: number;
    tempid?: number;
    lang?: string;
    name?: string;
    timestamp?: any;
    message?: string;
    duration?: any;
  };
  id?: any;
}
