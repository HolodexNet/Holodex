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
import { Button } from "@/shadcn/ui/button";
import { TypographyH4 } from "@/shadcn/ui/typography";

export function VideoEditMusic({ video }: { video: Video }) {
  const [time, setTime] = useState(0);
  const [timeEnd, setTimeEnd] = useState(180);
  const [trackName, setTrackName] = useState("");
  const [artist, setArtist] = useState("");
  const [duration, setTimeDuration] = useState(180);

  return (
    <div className="flex flex-col justify-items-stretch gap-4 pt-4 text-base-11">
      <TypographyH4 className="text-base-12">
        <div className="i-lucide:list-plus mr-1 inline-block align-middle"></div>
        Add New Song / Select song from Tracklist to modify
      </TypographyH4>

      <div className="">
        <Label htmlFor="itunes_search">
          Autofill Song Info using iTunes / Musicdex (optional)
        </Label>
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
      <div className="flex gap-2">
        <Button variant="ghost" className="bg-primaryA-4 hover:bg-primaryA-8">
          Add Song
        </Button>
        <Button
          variant="ghost"
          className="bg-redA-4 hover:bg-redA-8 active:bg-redA-11"
        >
          Reset
        </Button>
        <Button variant="ghost-secondary">Listen to Track on iTunes</Button>
      </div>
      <hr className="border-base-4" />
      <TypographyH4 className="text-base-12">
        <div className="i-lucide:list-music mr-1 inline-block align-middle"></div>
        Tracklist:
      </TypographyH4>
      <div className="min-h-4 rounded-lg bg-base-3"></div>
    </div>
  );
}
