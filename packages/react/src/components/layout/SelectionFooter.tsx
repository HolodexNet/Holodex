import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent } from "@/shadcn/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shadcn/ui/dropdown-menu";
import { useVideoSelection } from "@/hooks/useVideoSelection";
import { siteIsSmallAtom } from "@/hooks/useFrame";
import { useTranslation } from "react-i18next";
import { makeYtThumbnailUrl } from "@/lib/utils";
import { VideoThumbnail } from "../video/VideoThumbnail";
import { SelectionEditShortcuts } from "../edit/selection/SelectionEditShortcuts";
const SelectedVideosModal = ({
  isSmall,
  open,
  onOpenChange,
}: {
  isSmall: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { selectedVideos } = useVideoSelection();

  const getThumbnailSrc = (video: PlaceholderVideo) => {
    const size = isSmall ? "sm" : "md";
    return video.type === "placeholder"
      ? video.thumbnail
      : makeYtThumbnailUrl(video.id, size);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {selectedVideos.map((video) => (
          <div key={video.id} className="flex items-center space-x-4 p-2">
            <VideoThumbnail
              src={getThumbnailSrc(video)}
              alt={video.title}
              className="h-auto w-24 rounded"
            />
            <div>
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-500">{}</p>
            </div>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
};

const SelectionFooter = () => {
  const { t } = useTranslation();
  const { selectionMode, selectedVideos, setSelectionMode, clearSelection } =
    useVideoSelection();
  const [showVideos, setShowVideos] = useState(false);
  const [page, setPage] = useState(0);
  const [isSmall] = useAtom(siteIsSmallAtom);

  const exit = () => {
    clearSelection();
    setSelectionMode(false);
    setPage(0);
  };

  if (!selectionMode) return null;

  return (
    <footer
      id="selectionFooter"
      className="sticky bottom-0 right-0 flex bg-base-3 p-1 shadow-lg"
      style={{ bottom: "var(--footer-height-clearance)" }}
    >
      <SelectedVideosModal
        isSmall={isSmall}
        open={showVideos}
        onOpenChange={setShowVideos}
      />

      <Button
        variant="outline"
        size="sm"
        className={`self-start transition-all ${
          selectedVideos.length === 0 ? "h-10 w-10 p-0" : "w-auto"
        }`}
        onClick={exit}
      >
        <span className="i-mdi:close-circle text-xl" />
      </Button>

      <div className="ml-4 space-y-2">
        {page === 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedVideos.length > 0 && (
              <>
                <Button
                  variant="base-outline"
                  size="sm"
                  onClick={clearSelection}
                  className="flex items-center"
                >
                  <span className="i-material-symbols:deselect mr-2" />
                  Deselect
                </Button>

                <Button
                  variant="base-outline"
                  size="sm"
                  onClick={() => setShowVideos(!showVideos)}
                  className="flex items-center"
                >
                  <span className="i-mdi:select-search mr-2" />
                  Show {selectedVideos.length} Videos
                </Button>
              </>
            )}

            <Button variant="ghost" size="sm" disabled={!selectedVideos.length}>
              Open in Multiview
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="base-outline"
                  size="sm"
                  disabled={!selectedVideos.length}
                  className="flex items-center"
                >
                  <span className="i-material-symbols:list-alt-outline mr-2" />
                  Playlist
                  <div className="i-lucide:chevron-up ml-2 size-4"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPage(1)}>
                  Add to current Playlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPage(2)}>
                  Make into new Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="base-outline"
                  size="sm"
                  disabled={selectedVideos.length === 0}
                  className="flex items-center"
                >
                  <span className="i-lucide:tag mr-2" />
                  Modify Attributes
                  <div className="i-lucide:chevron-up ml-2 size-4"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPage(1)}>
                  Mentions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPage(2)}>
                  Sources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPage(3)}>
                  Topic
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Language (clips only)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Placeholder for SelectionEditShortcuts component */}
            <SelectionEditShortcuts />
          </div>
        )}

        {page !== 0 && (
          <div className="text-sm">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a
                    href="#"
                    className="text-gray-700 hover:text-blue-600"
                    onClick={() => setPage(0)}
                  >
                    Selection ({selectedVideos.length})
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-500">
                      {page === 1 && "Mentions"}
                      {page === 2 && "Sources"}
                      {page === 3 && "Topic"}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        )}
      </div>
    </footer>
  );
};

export default SelectionFooter;
