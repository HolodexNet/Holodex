import { useClient } from "@/hooks/useClient";
import { HTTPError } from "@/lib/fetch";
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

export function usePlaylists(options?: UseQueryOptions<PlaylistStub[]>) {
  const client = useClient();

  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () =>
      await client<PlaylistStub[]>("/api/v2/users/playlists"),
    ...options,
  });
}

export function usePlaylist(id: number, options?: UseQueryOptions<Playlist>) {
  const client = useClient();

  return useQuery({
    queryKey: ["playlist", id],
    queryFn: async () => {
      const p = await client<Playlist>(`/api/v2/playlist/${id}`);
      p.videos = p.videos || []; // null check this
      return p;
    },
    ...options,
  });
}

export function usePlaylistInclude(
  videoId: string,
  options?: CommonQueryConfig,
) {
  const client = useClient();

  return useQuery({
    queryKey: ["playlist", "include", videoId],
    queryFn: async () =>
      await client<PlaylistInclude[]>(`/api/v2/video-playlist/${videoId}`),
    staleTime: 30000,
    ...options,
    enabled: options?.enabled && client.loggedIn,
  });
}

export function usePlaylistVideoMutation(
  options?: UseMutationOptions<
    boolean,
    HTTPError,
    { id: number; videoId: string }
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, videoId }) =>
      await client<boolean>(`/api/v2/video-playlist/${id}/${videoId}`, {
        method: "PUT",
      }),
    ...options,
    onSuccess: (_, vars, c) => {
      queryClient.invalidateQueries({
        queryKey: ["playlist", "include", vars.videoId],
      });
      queryClient.invalidateQueries({ queryKey: ["playlist", vars.id] });
      options?.onSuccess?.(_, vars, c);
    },
  });
}

export function usePlaylistVideoMassAddMutation(
  options?: UseMutationOptions<
    number,
    HTTPError,
    { id: number; videoIds: string[] }
  >,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      videoIds,
    }: {
      id: number;
      videoIds: string[];
    }) => {
      const playlist = await client<PlaylistStub>(`/api/v2/playlist/${id}`);

      playlist.video_ids = videoIds.concat(
        playlist.video_ids.filter((id) => !videoIds.includes(id)),
      );

      return await client.post<number, PlaylistStub>(
        `/api/v2/playlist/`,
        playlist,
      );
    },
    ...options,
    onSuccess: (_, vars, c) => {
      options?.onSuccess?.(_, vars, c);

      queryClient.invalidateQueries({ queryKey: ["playlist", vars.id] });
      queryClient.invalidateQueries({ queryKey: ["playlist", "include"] });
    },
  });
}

export function usePlaylistDeleteMutation(
  options?: UseMutationOptions<void, HTTPError, { playlistId: number }>,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  const location = useLocation();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ playlistId }) =>
      await client.delete<void>(`/api/v2/playlist/${playlistId}`),
    ...options,
    onSuccess: (_, { playlistId }) => {
      const onPlaylistPage = location.pathname === `/playlist/${playlistId}`;

      queryClient.setQueryData<PlaylistStub[]>(["playlists"], (oldData) => {
        if (oldData) {
          return oldData.filter((playlist) => playlist.id !== playlistId);
        }
        return oldData;
      });

      if (onPlaylistPage) {
        navigate("/playlists");
      }
    },
  });
}

export function usePlaylistSaveMutation(
  options?: UseMutationOptions<number, HTTPError, Partial<PlaylistStub>>,
) {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlist) => {
      return client.post<number, Partial<PlaylistStub>>(
        "/api/v2/playlist/",
        playlist,
      );
    },
    ...options,
    onSuccess: (data, variables, context) => {
      // new playlist
      if (!variables.id) {
        queryClient.setQueryData<PlaylistInclude[]>(
          ["playlist", "include", variables.video_ids![0]],
          (includesArr) => {
            const includesElement = [
              { id: data, name: variables.name!, contains: true },
            ];
            return includesArr
              ? includesArr.concat(includesElement)
              : includesElement;
          },
        );
      }

      // grab new updated_at, video objects
      queryClient.invalidateQueries({
        queryKey: ["playlists"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["playlist", variables.id],
      });

      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
  });
}
