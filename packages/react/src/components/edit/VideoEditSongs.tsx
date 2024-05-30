import { useForm } from "react-hook-form";
import { SongSearch } from "./SongSearch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { useAtomValue } from "jotai";
import { currentVideoAtom, defaultPlayerEventBus } from "@/store/player";
import { Input } from "@/shadcn/ui/input";
import { TypographyH3 } from "@/shadcn/ui/typography";
import { useTranslation } from "react-i18next";
import { SongTimeSlider } from "./TimeSlider";
import { useEffect, useState } from "react";
import { Progress } from "@/shadcn/ui/progress";

export function VideoEditSongs() {
  const { t } = useTranslation();
  const currentVideo = useAtomValue(currentVideoAtom);
  const [progress, setProgress] = useState(0);
  const form = useForm<Song>({
    defaultValues: {
      amUrl: null,
      art: null,
      available_at: undefined,
      channel: {
        name: currentVideo?.channel.name,
        english_name: currentVideo?.channel.english_name,
      },
      channel_id: currentVideo?.channel_id,
      name: undefined,
      original_artist: "",
      start: 0,
      end: 10,
      itunesid: null,
      song: null,
      video_id: currentVideo?.id,
    },
  });

  useEffect(() => {
    const onProgress = defaultPlayerEventBus.on(
      "onProgress",
      (_, { playedSeconds }) => setProgress(playedSeconds),
    );

    return () => {
      onProgress();
    };
  }, []);

  console.log((progress - form.getValues("start")) * 10);

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4">
        <TypographyH3>{t("editor.music.titles.addSong")}</TypographyH3>
        <FormField
          control={form.control}
          name="song"
          render={({ field }) => (
            <FormItem className="flex gap-4">
              <FormControl>
                <SongSearch
                  value={form.watch("song")}
                  onSelect={(song) =>
                    form.setValue(
                      "song",
                      song
                        ? {
                            ...song,
                            index: `iTunes${song?.trackId}`,
                            src: "iTunes",
                          }
                        : null,
                    )
                  }
                />
              </FormControl>
              <FormItem className="flex flex-col">
                <FormLabel>Track ID</FormLabel>
                <Input
                  className="w-fit min-w-[2rem]"
                  disabled
                  value={form.watch("song.trackId")}
                />
              </FormItem>
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Track Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="original_artist"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Original Artist</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Start</FormLabel>
                <Input {...field} />
                <Progress
                  max={100}
                  value={(progress - form.getValues("start")) * 10}
                />
                <FormControl>
                  <SongTimeSlider
                    inverted
                    onValueChange={([amount]) =>
                      form.setValue(
                        "start",
                        Math.max(0, form.getValues("start") - amount),
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Duration</FormLabel>
                <Input {...field} />
                <Progress
                  max={100}
                  value={(progress - form.getValues("end")) * 10}
                />
                <FormControl>
                  <SongTimeSlider
                    onValueChange={([amount]) =>
                      form.setValue(
                        "end",
                        Math.max(0, form.getValues("end") + amount),
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
