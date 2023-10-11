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
    async () => (await client<PlaylistStub[]>("/users/playlists")).data,
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
    async () => (await client<Playlist>(`/playlist/${id}`)).data,
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
      (await client<PlaylistInclude[]>(`/video-playlist/${videoId}`)).data,
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
      (
        await client<boolean>(`/video-playlist/${id}/${videoId}`, {
          method: "PUT",
        })
      ).data,
    options,
  );
}
