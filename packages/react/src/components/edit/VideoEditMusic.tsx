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
import useTrackTiming from "./useTrackTiming";

export function VideoEditMusic({ video }: { video: Video }) {
  const {
    timeStart,
    timeEnd,
    duration,
    adjustStartTime,
    adjustEndTime,
    adjustDuration,
  } = useTrackTiming(Math.floor(video.duration || 12 * 60 * 60));

  const [trackName, setTrackName] = useState("");
  const [artist, setArtist] = useState("");

  return (
    <div className="flex flex-col justify-items-stretch gap-4 p-4">
      <TypographyH4 className="">
        <div className="i-lucide:list-plus mr-1 inline-block align-middle"></div>
        Add New Song / Select song from Tracklist to modify
      </TypographyH4>

      <div className="">
        <Label htmlFor="itunes_search">
          Autofill Song Info using iTunes / Musicdex (optional)
        </Label>
        <ItunesSearchDropdown
          onSelectItem={(item) => {
            setTrackName(item.trackName);
            setArtist(item.artistName);
            adjustDuration(item.trackTimeMillis / 1000);
          }}
        />
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
        <div className="focus-within: flex justify-center rounded-md border border-solid border-input pt-2 pb-6 focus-within:ring-2">
          <div>
            <TimeAdjuster
              videoId={video.id}
              value={timeStart}
              onValueChange={adjustStartTime}
            />
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="mx-1 mt-5 mb-1 cursor-pointer rounded-sm p-2">
                  <div className="i-ic:sharp-start"></div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Test Start</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="max-w-32 basis-1/4">
            <DurationAdjuster
              value={duration}
              onValueChange={adjustDuration}
              max={(video.duration || 12 * 60 * 60) - timeStart}
            />
          </div>

          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="mx-1 mt-5 mb-1 cursor-pointer rounded-sm p-2">
                  <div className="i-ic:sharp-keyboard-tab"></div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">Test End</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div>
            <TimeAdjuster
              videoId={video.id}
              value={timeEnd}
              onValueChange={adjustEndTime}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" className="">
          Add Song
        </Button>
        <Button variant="destructive" className="">
          Reset
        </Button>
        <Button variant="secondary">Listen to Track on iTunes</Button>
      </div>
      <hr className="" />
      <TypographyH4 className="">
        <div className="i-lucide:list-music mr-1 inline-block align-middle"></div>
        Tracklist:
      </TypographyH4>
      <div className="min-h-4 rounded-lg"></div>
    </div>
  );
}
