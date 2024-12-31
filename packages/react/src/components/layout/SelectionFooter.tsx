import React, { Suspense, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/shadcn/ui/button";
import { Dialog, DialogContent } from "@/shadcn/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuGroup,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/shadcn/ui/dropdown-menu";
import { useVideoSelection } from "@/hooks/useVideoSelection";
import { siteIsSmallAtom } from "@/hooks/useFrame";
import { useTranslation } from "react-i18next";
import { makeThumbnailUrl } from "@/lib/utils";
import { VideoThumbnail } from "../video/VideoThumbnail";
import { SelectionEditShortcuts } from "../edit/selection/SelectionEditShortcuts";
import SelectionFooterTopicPicker from "../edit/selection/SelectionFooterTopicPicker";
import {
  usePlaylistVideoMassAddMutation,
  usePlaylists,
} from "@/services/playlist.service";
import { userAtom } from "@/store/auth";
import { Link } from "react-router-dom";
import { LazyNewPlaylistDialog } from "../video/LazyNewPlaylistDialog";
import { useToast } from "@/shadcn/ui/use-toast";
import { queueAtom } from "@/store/queue";

const SelectedVideosModal = ({
  isSmall,
  open,
  onOpenChange,
}: {
  isSmall: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { selectedVideos, setSelectedVideos } = useVideoSelection();

  const getThumbnailSrc = (video: PlaceholderVideo) => {
    const size = isSmall ? "sm" : "md";
    return makeThumbnailUrl(video.id, size, video.thumbnail);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[50vh] min-w-min max-w-[min(500px,calc(100vw-40px))] flex-col gap-0 overflow-y-auto overflow-x-hidden px-0 py-6">
        {selectedVideos.map((video, idx) => (
          <div
            key={video.id}
            className={
              "flex items-center space-x-2 px-2 py-1 " +
              (idx % 2 === 0 ? "bg-base-3" : "")
            }
          >
            <Button
              variant="ghost"
              size="icon-lg"
              className="size-10 shrink-0"
              onClick={() =>
                setSelectedVideos((prev) =>
                  prev.filter((v) => v.id !== video.id),
                )
              }
            >
              <div className="i-heroicons:x-mark" />
              <span className="sr-only">Remove</span>
            </Button>
            <Link
              to={`/watch/${video.id}`}
              className="block w-24 shrink-0 overflow-hidden rounded"
            >
              <VideoThumbnail
                src={getThumbnailSrc(video)}
                alt={video.title}
                className=""
              />
            </Link>
            <div className="min-w-80">
              <h3 className="line-clamp-2 font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-500">{}</p>
              {/*  what was i doing here again why is this block empty ^ */}
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
      className="sticky bottom-0 right-0 flex border-t border-base-6 bg-base-3 p-1 shadow-lg"
      style={{ bottom: "var(--footer-height-clearance)" }}
    >
      <SelectedVideosModal
        isSmall={isSmall}
        open={showVideos}
        onOpenChange={setShowVideos}
      />

      <Button
        variant="link"
        size="icon"
        className={`h-6 self-start transition-all hover:text-primary-10 ${
          selectedVideos.length === 0 ? "w-20" : ""
        }`}
        onClick={exit}
      >
        <div className="i-mdi:close-circle text-xl" />
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
                >
                  <span className="i-material-symbols:deselect" />
                  Deselect
                </Button>

                <Button
                  variant="base-outline"
                  size="sm"
                  onClick={() => setShowVideos(!showVideos)}
                >
                  <span className="i-mdi:select-search" />
                  Show {selectedVideos.length} Videos
                </Button>
              </>
            )}

            <Button
              variant="base-outline"
              size="sm"
              disabled={!selectedVideos.length}
              // TODO: onclick behavior once Multiview is finished.
            >
              <span className="i-heroicons:rectangle-group" />
              Open in Multiview
            </Button>

            <SelectionModifyPlaylistMenu disabled={!selectedVideos.length} />

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
          <div className="flex items-center justify-between">
            <nav className="flex items-center" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 px-2">
                <li>
                  <div
                    onClick={() => setPage(0)}
                    className="flex cursor-pointer items-center text-sm font-medium"
                  >
                    <div className="i-lucide:chevron-left mr-1" />
                    Back
                  </div>
                </li>
                <li className="text-sm font-medium text-base-10">
                  | Selected ({selectedVideos.length}) |
                </li>
                <li className="text-sm font-medium">
                  {page === 1 && "Mentions"}
                  {page === 2 && "Sources"}
                  {page === 3 && "Set Topic: "}
                </li>
              </ol>
            </nav>
            <div className="flex items-center space-x-2">
              {page === 1 && (
                <>
                  <input
                    type="text"
                    placeholder="Search channels..."
                    className="rounded-md border px-2 py-1 text-sm"
                  />
                  <Button size="sm" variant="outline">
                    Add Mention
                  </Button>
                </>
              )}
              {page === 2 && (
                <>
                  <input
                    type="text"
                    placeholder="Enter source URL..."
                    className="rounded-md border px-2 py-1 text-sm"
                  />
                  <Button size="sm" variant="outline">
                    Add Source
                  </Button>
                </>
              )}
              {page === 3 && <SelectionFooterTopicPicker />}
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

function SelectionModifyPlaylistMenu({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation();
  const { selectedVideos } = useVideoSelection();

  const setQueue = useSetAtom(queueAtom);
  const { toast } = useToast();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="base-outline"
          size="sm"
          disabled={disabled}
          className="flex items-center"
        >
          <span className="i-heroicons:folder-open mr-2" />
          {t("component.mainNav.playlist")}
          <div className="i-lucide:chevron-up ml-2 size-4"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            setQueue((prev) => {
              return [
                ...selectedVideos.filter(
                  (v) => v.type === "stream" || v.type === "clip",
                ),
                ...prev.filter(
                  (v) => !selectedVideos.find(({ id }) => id === v.id),
                ),
              ];
            });

            toast({
              variant: "primary",
              title: "Added to queue",
              duration: 2000,
            });
          }}
        >
          <div className="i-heroicons:queue-list" />
          Add to Queue
        </DropdownMenuItem>
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="bg-base-1">
              <div className="i-solar:playlist-broken" />
              Add to Playlist
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <SelectionModifyPlaylistSubmenu />
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectionModifyPlaylistSubmenu() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { mutate } = usePlaylistVideoMassAddMutation({
    onSuccess: () => {
      toast({
        title: "Added to playlist",
        duration: 2000,
        variant: "primary",
      });
    },
  });
  const { data, isLoading } = usePlaylists();
  const user = useAtomValue(userAtom);
  const { selectedVideos } = useVideoSelection();
  const videoIds = selectedVideos
    .filter((v) => v.type === "stream" || v.type === "clip")
    .map((v) => v.id);

  return (
    <DropdownMenuSubContent>
      {!user ? (
        <DropdownMenuItem asChild>
          <Link to="/login">{t("component.mainNav.login")}</Link>
        </DropdownMenuItem>
      ) : (
        <>
          {data?.map(({ name, id }) => (
            <DropdownMenuItem key={id} onClick={() => mutate({ id, videoIds })}>
              {name}
            </DropdownMenuItem>
          ))}
          {isLoading && (
            <DropdownMenuItem className="justify-center" disabled>
              <div className="i-lucide:loader-2 animate-spin leading-none" />
            </DropdownMenuItem>
          )}
          {data?.length || isLoading ? <DropdownMenuSeparator /> : null}
          {videoIds && (
            <Suspense
              fallback={
                <div className="i-lucide:loader-2 animate-spin leading-none" />
              }
            >
              <LazyNewPlaylistDialog
                triggerElement={
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                  >
                    {t("component.playlist.menu.new-playlist")}
                  </DropdownMenuItem>
                }
                videoIds={videoIds}
              />
            </Suspense>
          )}
        </>
      )}
    </DropdownMenuSubContent>
  );
}

export default SelectionFooter;
