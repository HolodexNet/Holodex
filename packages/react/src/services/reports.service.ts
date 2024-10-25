import { useClient } from "@/hooks/useClient";
import { HTTPError } from "@/lib/fetch";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";

// Video report types
export type VideoReportReason =
  | "Incorrect video topic"
  | "Incorrect channel mentions"
  | "This video does not belong to the org"
  | "Low Quality/Misleading Content"
  | "Violates the org's derivative work guidelines or inappropriate"
  | "Other";

export interface VideoReportEmbed {
  fields: {
    name: string;
    value: string;
  }[];
}

// Channel report types
export interface ChannelReportEmbed {
  title: string;
  color: number; // hex to number
  fields: { name: string; value: string }[];
  footer?: { text: string };
}

export interface ChannelReportBody {
  content?: string;
  embeds: ChannelReportEmbed[];
}

// Contact report types
export interface ContactReportField {
  name: string;
  value: string;
}

export type ContactReportBody = ContactReportField[];

// Function to create a video report mutation
export function useVideoReportMutation(
  videoId: string,
  options?: UseMutationOptions<void, HTTPError, VideoReportEmbed>,
) {
  const client = useClient();
  return useMutation<void, HTTPError, VideoReportEmbed>({
    mutationFn: async (body) => {
      return await client.post(`/api/v2/reports/video/${videoId}`, body);
    },
    ...options,
  });
}

// Function to create a channel report mutation
export function useChannelReportMutation(
  options?: UseMutationOptions<void, HTTPError, ChannelReportBody>,
) {
  const client = useClient();
  return useMutation<void, HTTPError, ChannelReportBody>({
    mutationFn: async (body) => {
      return client.post("/api/v2/reports/channel", body);
    },
    ...options,
  });
}

// Function to create a contact report mutation
export function useContactReportMutation(
  options?: UseMutationOptions<void, HTTPError, ContactReportBody>,
) {
  const client = useClient();
  return useMutation<void, HTTPError, ContactReportBody>({
    mutationFn: async (body) => {
      return await client.post("/api/v2/reports/contact", body);
    },
    ...options,
  });
}
