import { z } from "zod";

export const placeholderSchema = z.object({
  id: z.string().optional(),
  channel_id: z.string().min(1, "Channel ID is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  liveTime: z.string().min(1, "Live time is required"),
  title: z.object({
    credits: z.object({
      editor: z.object({
        user: z.string().optional(),
        name: z.string().min(1, "Editor name is required"),
      }),
    }),
    name: z.string().min(1, "Title is required"),
    jp_name: z.string().optional(),
    link: z.string().url("Invalid URL"),
    thumbnail: z.string().url("Invalid URL"),
    placeholderType: z.enum([
      "event",
      "external-stream",
      "scheduled-yt-stream",
    ]),
    certainty: z.enum(["certain", "likely"]),
  }),
});

export type PlaceholderFormData = z.infer<typeof placeholderSchema>;
