import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { usePlaylistSaveMutation } from "@/services/playlist.service";
import { Button } from "@/shadcn/ui/button";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/auth";
import { useToast } from "@/shadcn/ui/use-toast";

interface Props {
  triggerElement: React.ReactNode;
  videoIds: string[];
}

export default function NewPlaylistDialog({ triggerElement, videoIds }: Props) {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      name: "", // name of the new playlist
    },
  });

  const saveMutation = usePlaylistSaveMutation({
    onSuccess: () => {
      setOpen(false);
      toast({
        // todo: intl this
        title: "Playlist created.",
      });
    },
  });

  const user = useAtomValue(userAtom);

  const onSubmit = (data: { name: string }) => {
    if (!user) {
      setOpen(false);
      toast({
        title: t("views.playlist.login-prompt"),
      });
      return;
    }

    saveMutation.mutate({
      name: data.name,
      video_ids: videoIds,
      user_id: user?.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("views.playlist.new-playlist-btn-label")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="new-playlist-form">
            <FormField
              control={form.control}
              name="name"
              rules={{
                // todo: intl this
                required: "Playlist name cannot be empty.",
              }}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Playlist Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="new-playlist-form">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
