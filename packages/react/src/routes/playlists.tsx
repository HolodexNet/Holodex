import React, { useState } from "react";
import {
  usePlaylistSaveMutation,
  usePlaylists,
} from "@/services/playlist.service";
import PlaylistEntry from "@/components/playlist/PlaylistEntry";
import { TypographyH3, TypographyP } from "@/shadcn/ui/typography";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Button } from "@/shadcn/ui/button";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/auth";
import { Card } from "@/shadcn/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shadcn/ui/dialog";
import { Input } from "@/shadcn/ui/input";
import { useNavigate } from "react-router-dom";
import { useClient } from "@/hooks/useClient";

export function Playlists() {
  const { data: playlists, refetch } = usePlaylists();
  const { mutateAsync: savePlaylist } = usePlaylistSaveMutation();
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);
  const fetchClient = useClient();
  const [isNewPlaylistDialogOpen, setIsNewPlaylistDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const navigate = useNavigate();

  const handleCreateNewPlaylist = async () => {
    console.log("Creating new playlist:", newPlaylistName);
    setIsNewPlaylistDialogOpen(false);
    setNewPlaylistName("");
    const newId = await savePlaylist({
      name: newPlaylistName,
      video_ids: [],
      user_id: user?.id,
    });
  };

  return (
    <>
      <Helmet>
        <title>{t("component.mainNav.playlist")} - Holodex</title>
      </Helmet>
      <div className="container">
        <TypographyH3>{t("views.playlist.page-heading")}</TypographyH3>

        <Card
          className="my-4 cursor-pointer"
          onClick={() =>
            user ? setIsNewPlaylistDialogOpen(true) : navigate("/login")
          }
        >
          <div className="flex items-center p-4">
            <div className="i-lucide:list-plus mr-3 text-xl" />
            <div>
              <TypographyP className="font-medium">
                {t("views.playlist.new-playlist-btn-label")}
              </TypographyP>
              {!user && (
                <TypographyP className="text-sm text-base-11">
                  {t("views.playlist.login-prompt")}
                </TypographyP>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] md:flex md:flex-col">
          {playlists?.map((playlist) => (
            <PlaylistEntry {...playlist} key={playlist.id} />
          ))}
        </div>
      </div>

      <Dialog
        open={isNewPlaylistDialogOpen}
        onOpenChange={setIsNewPlaylistDialogOpen}
      >
        <DialogContent aria-description="Create new playlist">
          <DialogHeader>
            <DialogTitle>
              {t("views.playlist.new-playlist-btn-label")}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder={"Must Watch"}
          />
          <DialogFooter className="gap-y-2">
            <Button
              variant="outline"
              onClick={() => setIsNewPlaylistDialogOpen(false)}
            >
              {t("component.mainNav.back")}
            </Button>
            <Button
              variant="primary"
              disabled={!newPlaylistName}
              onClick={handleCreateNewPlaylist}
              className="min-w-28"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
