import React, { useState } from "react";
import { usePlaylists } from "@/services/playlist.service";
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

export function Playlists() {
  const { data: playlists, refetch } = usePlaylists();
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);
  const [isNewPlaylistDialogOpen, setIsNewPlaylistDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const navigate = useNavigate();

  const handleCreateNewPlaylist = async () => {
    // TODO: Implement the API call to create a new playlist
    console.log("Creating new playlist:", newPlaylistName);
    setIsNewPlaylistDialogOpen(false);
    setNewPlaylistName("");
    await refetch();
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
            <span className="i-heroicons:playlist-plus mr-3 text-4xl" />
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

        {playlists?.map((playlist) => (
          <PlaylistEntry {...playlist} key={playlist.id} />
        ))}
      </div>

      <Dialog
        open={isNewPlaylistDialogOpen}
        onOpenChange={setIsNewPlaylistDialogOpen}
      >
        <DialogContent>
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
          <DialogFooter>
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
