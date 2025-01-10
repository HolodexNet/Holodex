import { useClient } from "@/hooks/useClient";
import { HTTPError } from "@/lib/fetch";
import {
  useQueryClient,
  useMutation,
  UseMutationOptions,
} from "@tanstack/react-query";

interface SmartEditContext {
  pageVideoId?: string;
  pageChannelId?: string;
}

interface SmartEditResponse {
  success: boolean;
  result: unknown;
}

interface SmartEditBasePayload extends SmartEditContext {
  videoIds: string[];
}

interface DissociateVideoPayload extends SmartEditBasePayload {
  targetVideoId: string;
}

interface DissociateChannelPayload extends SmartEditBasePayload {
  channelId: string;
}

/**
 * Merges participant lists across multiple videos
 */
export function useMergeParticipantsMutation(
  options?: UseMutationOptions<
    SmartEditResponse,
    HTTPError,
    SmartEditBasePayload
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      await client.post("/api/smart-edit/merge-participants", payload),
    ...options,
    onSuccess: (_, variables, context) => {
      // Invalidate queries for all affected videos
      variables.videoIds.forEach((videoId) => {
        queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      });
      options?.onSuccess?.(_, variables, context);
    },
  });
}

/**
 * Creates simulcast relationships between videos
 */
export function useSimulcastMutation(
  options?: UseMutationOptions<
    SmartEditResponse,
    HTTPError,
    SmartEditBasePayload
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      await client.post("/api/smart-edit/make-simulcast", payload),
    ...options,
    onSuccess: (_, variables, context) => {
      variables.videoIds.forEach((videoId) => {
        queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      });
      options?.onSuccess?.(_, variables, context);
    },
  });
}

/**
 * Creates refer relationships between videos
 */
export function useReferMutation(
  options?: UseMutationOptions<
    SmartEditResponse,
    HTTPError,
    SmartEditBasePayload
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      await client.post("/api/smart-edit/make-refer", payload),
    ...options,
    onSuccess: (_, variables, context) => {
      variables.videoIds.forEach((videoId) => {
        queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      });
      options?.onSuccess?.(_, variables, context);
    },
  });
}

/**
 * Dissociates videos from a target video
 */
export function useDissociateVideoMutation(
  options?: UseMutationOptions<
    SmartEditResponse,
    HTTPError,
    DissociateVideoPayload
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      await client.post("/api/smart-edit/dissociate-video", payload),
    ...options,
    onSuccess: (_, variables, context) => {
      // Invalidate both the selected videos and the target video
      [...variables.videoIds, variables.targetVideoId].forEach((videoId) => {
        queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      });
      options?.onSuccess?.(_, variables, context);
    },
  });
}

/**
 * Dissociates videos from a channel
 */
export function useDissociateChannelMutation(
  options?: UseMutationOptions<
    SmartEditResponse,
    HTTPError,
    DissociateChannelPayload
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      await client.post("/api/smart-edit/dissociate-channel", payload),
    ...options,
    onSuccess: (_, variables, context) => {
      variables.videoIds.forEach((videoId) => {
        queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      });
      // Also invalidate channel queries
      if (variables.channelId) {
        queryClient.invalidateQueries({
          queryKey: ["channel", variables.channelId],
        });
      }
      options?.onSuccess?.(_, variables, context);
    },
  });
}

/**
 * Removes all mentions from selected videos
 */
export function useRemoveMentionsMutation(
  options?: UseMutationOptions<
    SmartEditResponse,
    HTTPError,
    SmartEditBasePayload
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      await client.post("/api/smart-edit/remove-mentions", payload),
    ...options,
    onSuccess: (_, variables, context) => {
      variables.videoIds.forEach((videoId) => {
        queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      });
      options?.onSuccess?.(_, variables, context);
    },
  });
}
