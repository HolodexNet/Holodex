import { formatDuration } from "@/lib/time";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";
import React, { useMemo } from "react";

// Helper types
interface ParsedComment {
  time: number;
  occurence: number;
  text?: string;
  song?: Song;
}

interface Bucket {
  time: number;
  count: number;
  best?: string;
  song?: Song;
  display: string;
  // absolute?: string;
}

// Constants

const MIN_BUCKET_SIZE = 2;
const MIN_TIMESTAMP_OCCURENCE = 1;
const COMMENT_TIMESTAMP_REGEX =
  /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])([^\r\n]+)?/gm;
const STOP_WORDS = new Set(["an", "the"]);

// Helper functions
const removeStopWords = (words: string) => {
  return words
    .split(" ")
    .filter((s) => !STOP_WORDS.has(s.toLowerCase()))
    .join(" ");
};

const removePunctuations = (input: string) => {
  return input.replace(/[*,\-.\][()、。]/g, "");
};

const filterByWordCount = (limit = 2) => {
  return (input: string) => input.split(" ").length >= limit;
};

const parseTimestampComments = (
  message: string,
  videoDuration: number,
): ParsedComment[] => {
  const pairs = [];
  let match = COMMENT_TIMESTAMP_REGEX.exec(message);
  while (match != null) {
    const hr = match[1];
    const min = match[2];
    const sec = match[3];
    const time = Number(hr ?? 0) * 3600 + Number(min) * 60 + Number(sec);
    const text = match[4];

    if (time < videoDuration) {
      pairs.push({ time, text, occurence: 0 });
    }
    match = COMMENT_TIMESTAMP_REGEX.exec(message);
  }

  for (const pair of pairs) {
    pair.occurence = pairs.length;
  }
  return pairs;
};

interface HighlightBarProps {
  video: PlaceholderVideo;
  onTimeJump?: (time: number) => void;
}

export default function HighlightBar({ video, onTimeJump }: HighlightBarProps) {
  const buckets = useMemo(() => {
    const BUCKETING_THRESHOLD_SECS = Math.max(
      Math.min(video.duration / 80, 120),
      40,
    ); //seconds

    const parsed: ParsedComment[] = [];
    for (const comment of video.comments ?? []) {
      const pairs = parseTimestampComments(
        comment.message,
        video.duration,
      ).filter((pair) => pair.text);

      if (pairs.length >= MIN_TIMESTAMP_OCCURENCE) {
        parsed.push(...pairs);
      }
    }

    parsed.sort((a, b) => a.time - b.time);

    const buckets: Bucket[] = [];
    let currentBucket = 0;
    let subBucket: ParsedComment[] = [];

    parsed.forEach((comment, index) => {
      if (
        comment.time - currentBucket <= BUCKETING_THRESHOLD_SECS &&
        index !== parsed.length - 1
      ) {
        subBucket.push(comment);
        return;
      }

      if (comment.time - currentBucket <= BUCKETING_THRESHOLD_SECS) {
        subBucket.push(comment);
      }

      if (subBucket.length >= MIN_BUCKET_SIZE) {
        const th = Math.floor(subBucket.length / 3);
        const median = subBucket[th].time;

        const matchingSong = (video?.songs as unknown as Song[])?.find(
          (song) => Math.abs(song.start - median) <= BUCKETING_THRESHOLD_SECS,
        );

        if (!matchingSong) {
          const processed = subBucket
            .sort(
              (a, b) =>
                b.occurence / b.text!.length - a.occurence / a.text!.length,
            )
            .map((s) => s.text!)
            .map(removePunctuations)
            .map(removeStopWords)
            .map((c) => c.trim())
            .filter((c) => c.length > 5);

          if (processed.length > 0) {
            let best = processed[0];

            const stricter = processed
              .filter(filterByWordCount(2))
              .filter((c) => !/(?:clip\s?(?:it|this)|[!?]{3})/i.test(c));

            if (stricter.length > 0) [best] = stricter;

            if (best.length > 60) best = `${best.slice(0, 60)}...`;

            buckets.push({
              time: median,
              count: subBucket.length,
              best,
              display: formatDuration(median * 1000),
            });
          }
        }
      }

      currentBucket = comment.time;
      subBucket = [];
      subBucket.push(comment);
    });

    // Add song markers
    if ((video?.songs as unknown as Song[])?.length) {
      buckets.push(
        ...(video?.songs as unknown as Song[]).map((song) => ({
          time: song.start,
          count: subBucket.length,
          song: {
            ...song,
            channel: video.channel,
          },
          display: new Date(song.start * 1000).toISOString().substr(11, 8),
        })),
      );
    }

    return buckets;
  }, [video.channel, video.comments, video.duration, video.songs]);

  const bucketsFiltered = useMemo(() => {
    const filtered = [...buckets];
    let cnt = 0;
    return filtered.filter((b) => {
      if (b.song) return true;
      if (cnt < 44) {
        cnt += 1;
        return true;
      }
      return false;
    });
  }, [buckets]);

  const computeItemStyle = (ts: number) => ({
    marginLeft: `${Math.round((ts / video.duration) * 100)}%`,
  });

  const computeTipStyle = (bucket: Bucket) => {
    const { count } = bucket;
    let width = "1px";
    let color = "rgb(100, 100, 100)";

    if (bucket.song) {
      width = "3px";
      color = "var(--primary)";
    }
    if (count > 1) {
      width = "2px";
      color = "rgb(164, 164, 164)";
    }
    if (count > 2) color = "darkorange";
    if (count > 3) color = "orange";
    if (count > 4) color = "rgb(208, 91, 91)";
    if (count > 5) color = "red";

    return {
      width,
      backgroundColor: color,
    };
  };

  if (!bucketsFiltered.length) return <div className="h-2"></div>;
  return (
    <div className="relative w-full cursor-pointer transition-all ease-out h-[10px] duration-200 hover:bg-base-4">
      {bucketsFiltered.map((bucket) => (
        <Tooltip key={`${bucket.time}-${bucket.display}`} delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              className="group absolute block h-full px-4 w-2 pl-[3px]"
              style={computeItemStyle(bucket.time)}
              onClick={() => onTimeJump?.(bucket.time)}
            >
              <div
                className="h-full transition-all duration-200 origin-center group-hover:scale-x-150"
                style={computeTipStyle(bucket)}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {bucket.best ? (
              <div className="mt-0.5">
                <time
                  className="block font-mono text-xs opacity-50"
                  // dateTime={bucket.absolute}
                >
                  {bucket.display}
                </time>
                {bucket.best}
              </div>
            ) : bucket.song ? (
              <div style={{ maxWidth: "350px" }}>
                {/* Implement SongItem component separately */}
                {bucket.song.name}
              </div>
            ) : null}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
