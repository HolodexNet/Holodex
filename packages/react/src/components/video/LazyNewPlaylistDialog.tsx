import { lazy } from "react";

export const LazyNewPlaylistDialog = lazy(
  () => import("@/components/playlist/NewPlaylistDialog"),
);
