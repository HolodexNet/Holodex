import { useCallback } from "react";
import { type VideoCardType } from "./VideoCard";
import {
  selectedVideoSetReadonlyAtom,
  useVideoSelection,
} from "@/hooks/useVideoSelection";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

export function useDefaultVideoCardClickHandler(
  video: VideoCardType,
  setPlaceholderOpen: (open: boolean) => void,
) {
  const navigate = useNavigate();
  const { selectionMode, addVideo, removeVideo } = useVideoSelection();
  const selectedSet = useAtomValue(selectedVideoSetReadonlyAtom);

  return useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const videoIsPlaceholder = video.type === "placeholder";
      const isTwitch = video.link?.includes("twitch");
      const videoHref =
        !isTwitch && video.status === "live" && video.link
          ? video.link
          : `/watch/${video.id}`;

      console.info("JS Video Click Handling", evt);
      const isLinkClick = (evt.target as HTMLElement).closest("a");
      const isChannelClick =
        isLinkClick?.getAttribute("dataBehavior") === "channelLink";
      if (isChannelClick) {
        return; // do not select, skip the entire handler
      }
      if (isLinkClick) {
        // Handle selection mode
        if (selectionMode) {
          if (selectedSet.has(video.id)) {
            removeVideo(video.id);
          } else {
            addVideo(video as PlaceholderVideo);
          }
          evt.preventDefault();
          evt.stopPropagation();
          return;
        }

        if (videoIsPlaceholder) {
          evt.preventDefault();
          evt.stopPropagation();
          return setPlaceholderOpen(true);
        }

        console.info("no action b/c closest element is a link.", evt);
        return;
      }
      // clicked a non-link part of the video card. Prevent default behavior.
      evt.preventDefault();
      evt.stopPropagation();

      if (evt.ctrlKey || evt.metaKey) {
        /** Control clicking a non-link part always goes to the external link no matter what the context */
        return window.open(videoHref, "_blank");
      }

      // Handle selection mode
      if (selectionMode) {
        if (selectedSet.has(video.id)) {
          removeVideo(video.id);
        } else {
          addVideo(video as PlaceholderVideo);
        }
        return;
      }

      if (videoIsPlaceholder) {
        return setPlaceholderOpen(true);
      }

      navigate(videoHref, { state: { video } });
    },
    [
      video,
      selectionMode,
      navigate,
      selectedSet,
      removeVideo,
      addVideo,
      setPlaceholderOpen,
    ],
  );
}
