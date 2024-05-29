import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { useToast } from "@/shadcn/ui/use-toast";
import { blockedChannelsAtom } from "@/store/settings";
import { useAtom } from "jotai";
import { Children, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCopyToClipboard } from "usehooks-ts";

interface ChannelMenuProps extends ShortChannel {
  children: ReactNode;
}

export function ChannelMenu({
  children,
  id: channelId,
  ...rest
}: ChannelMenuProps) {
  const [blockedChannels, setBlockedChannels] = useAtom(blockedChannelsAtom);
  const { toast } = useToast();
  const [, copy] = useCopyToClipboard();
  const { t } = useTranslation();

  const isBlocked = blockedChannels.some(({ id }) => id === channelId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>{Children.only(children)}</div>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={40}>
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() => {
            copy(`${window.location.origin}/channel/${channelId}`);
            toast({
              title: t("component.toast.copiedToClipboard"),
            });
          }}
        >
          <div className="i-heroicons:link" />
          {t("component.videoCard.copyLink")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() =>
            setBlockedChannels(
              isBlocked
                ? blockedChannels.filter(({ id }) => id !== channelId)
                : [...blockedChannels, { id: channelId, ...rest }],
            )
          }
        >
          <div className="i-heroicons:no-symbol" />
          {isBlocked
            ? t("component.channelSocials.unblock")
            : t("component.channelSocials.block")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
