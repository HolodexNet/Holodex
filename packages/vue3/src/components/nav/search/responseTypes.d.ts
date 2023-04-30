export enum AggregationKeys {
  FACET_BUCKET_CHANNEL_ORG = "facet_bucket_channel_org",
  FACET_BUCKET_TYPE = "facet_bucket_type",
  FACET_BUCKET_TOPIC = "facet_bucket_topic",
  FACET_BUCKET_STATUS = "facet_bucket_status",
  FACET_BUCKET_SONGS = "facet_bucket_songs",
  FACET_BUCKET_AVAILABLE_AT = "facet_bucket_available_at",
  // Add other keys here
}

export interface SearchResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: null | number;
    hits: Hit[];
  };
  aggregations: {
    [key in AggregationKeys]: Aggregation;
  };
}

export interface Hit {
  _index: string;
  _id: string;
  _score: number;
  _source: Source;
  sort: Array<string | number>;
}

export interface Source
  extends Omit<VideoDetailed, "published_at" | "type" | "available_at"> {
  live_tl_count?: {
    id: number;
  };
  end_actual?: string;
  channel: ShortChannel;
  start_actual?: string;
  analyzed: boolean;
  title: string;
  type: string;
  start_scheduled?: string;
  duration: number;
  updated_at: string;
  involved?: {
    orgs?: string[];
    vtubers?: string[];
  };
  live_viewers?: number;
  privacy_status: string;
  id: string;
  topic_id?: string;
  published_at: string;
  channel_id: string;
  available_at: string;
  status: VIDEO_STATUSES;
  sources?: VideoRef[];
  clips?: VideoRef[];
  mentions?: ShortChannel[];
  lang?: string;
}

export interface Aggregation {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: Bucket[];
}

export interface Bucket {
  key: string | "<2019" | "2019" | "2020" | "2021" | "2022" | ">2022";
  doc_count: number;
  to?: number;
  to_as_string?: string;
  from?: number;
  from_as_string?: string;
}
