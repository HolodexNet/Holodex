import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shadcn/ui/alert-dialog";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePlaylistDeleteMutation } from "@/services/playlist.service";

interface Props {
  triggerElement: React.ReactNode;
  playlistId: number;
  playlistName: string;
}

export default function DeletePlaylistDialog({
  triggerElement,
  playlistId,
  playlistName,
}: Props) {
  const { t } = useTranslation();
  const deleteMutation = usePlaylistDeleteMutation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{triggerElement}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("component.playlist.menu.delete-playlist")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {/* todo: intl this */}
            Are you sure you want to delete playlist <b>{playlistName}</b>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {t("views.library.deleteConfirmationCancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate({ playlistId })}
          >
            {t("views.library.deleteConfirmationOK")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
