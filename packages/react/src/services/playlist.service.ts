import { useClient } from "@/hooks/useClient";
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
    queryFn: async () => await client<Playlist>(`/api/v2/playlist/${id}`),
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
    ...options,
  });
}

export function usePlaylistVideoMutation(
  options?: UseMutationOptions<boolean, Error, { id: number; videoId: string }>,
) {
  const client = useClient();

  return useMutation({
    mutationFn: async ({ id, videoId }) =>
      await client<boolean>(`/api/v2/video-playlist/${id}/${videoId}`, {
        method: "PUT",
      }),
    ...options,
  });
}

export function usePlaylistDeleteMutation(
  options?: UseMutationOptions<void, Error, { playlistId: number }>,
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
  options?: UseMutationOptions<number, Error, Partial<PlaylistStub>>,
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
      });
      queryClient.invalidateQueries({
        queryKey: ["playlist", variables.id],
      });

      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
  });
}
