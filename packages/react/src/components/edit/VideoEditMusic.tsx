import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shadcn/ui/tooltip";
import { DurationAdjuster, TimeAdjuster } from "./DraggableTimestamp";
import { useState } from "react";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { ItunesSearchDropdown } from "./ItunesSearchDropdown";

export function VideoEditMusic({ video }: { video: Video }) {
  const [time, setTime] = useState(0);
  const [timeEnd, setTimeEnd] = useState(180);
  const [trackName, setTrackName] = useState("");
  const [artist, setArtist] = useState("");
  const [duration, setTimeDuration] = useState(180);

  return (
    <div className="flex flex-col justify-items-stretch gap-4 pt-4">
      <div className="">
        <Label htmlFor="itunes_search">iTunes/Musicdex Lookup</Label>
        <ItunesSearchDropdown />
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        <div className="grid min-w-80 grow gap-1">
          <Label htmlFor="track_name">Track Name</Label>
          <Input
            type="text"
            id="track_name"
            placeholder="Track Name"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
          />
        </div>
        <div className="grid min-w-80 grow gap-1">
          <Label htmlFor="artist_field">Original Artist</Label>
          <Input
            type="text"
            id="artist_field"
            placeholder="Original Artist"
            value={trackName}
            onChange={(e) => setTrackName(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="track_name">Track Timing Controls</Label>
        <div className="row flex justify-center border border-solid border-base-4 pb-6 pt-2">
          <div>
            <TimeAdjuster
              videoId={video.id}
              value={time}
              onValueChange={setTime}
            />
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="mx-3 mt-7 text-base-8 hover:text-base-10">
                  <div className="i-ic:sharp-start  cursor-pointer"></div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Test Start</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="max-w-32 basis-1/4">
            <DurationAdjuster
              value={duration}
              onValueChange={setTimeDuration}
            />
          </div>

          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="mx-3 mt-7 text-base-8 hover:text-base-10">
                  <div className="i-ic:sharp-keyboard-tab cursor-pointer"></div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Test End</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div>
            <TimeAdjuster
              videoId={video.id}
              value={timeEnd}
              onValueChange={setTimeEnd}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
