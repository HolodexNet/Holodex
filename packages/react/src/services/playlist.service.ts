import { useClient } from "@/hooks/useClient";
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export function usePlaylists(
  options?: UseQueryOptions<PlaylistStub[], AxiosError>,
) {
  const client = useClient();

  return useQuery<PlaylistStub[], AxiosError>(
    ["playlists"],
    async () => await client<PlaylistStub[]>("/api/v2/users/playlists"),
    options,
  );
}

export function usePlaylist(
  id: number,
  options?: UseQueryOptions<Playlist, AxiosError>,
) {
  const client = useClient();

  return useQuery<Playlist, AxiosError>(
    ["playlist", id],
    async () => await client<Playlist>(`/api/v2/playlist/${id}`),
    options,
  );
}

export function usePlaylistInclude(
  videoId: string,
  options?: UseQueryOptions<PlaylistInclude[], AxiosError>,
) {
  const client = useClient();

  return useQuery<PlaylistInclude[], AxiosError>(
    ["playlist", "include", videoId],
    async () =>
      await client<PlaylistInclude[]>(`/api/v2/video-playlist/${videoId}`),
    options,
  );
}

export function usePlaylistVideoMutation(
  options?: UseMutationOptions<
    boolean,
    AxiosError,
    { id: number; videoId: string }
  >,
) {
  const client = useClient();

  return useMutation<boolean, AxiosError, { id: number; videoId: string }>(
    async ({ id, videoId }) =>
      await client<boolean>(`/api/v2/video-playlist/${id}/${videoId}`, {
        method: "PUT",
      }),
    options,
  );
}
