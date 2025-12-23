import { useFavoriteMutation, useFavorites } from "@/services/user.service";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { blockedChannelsAtom } from "@/store/settings";
import { useAtom } from "jotai";

interface ChannelSocialsProps extends Pick<
  Channel,
  "id" | "name" | "english_name" | "type" | "twitter" | "twitch" | "photo"
> {
  size: "sm" | "lg";
}

export function ChannelSocials({
  size,
  id,
  name,
  english_name,
  type,
  twitter,
  twitch,
  photo,
}: ChannelSocialsProps) {
  const { t } = useTranslation();
  const { data } = useFavorites();
  const { mutate, isPending } = useFavoriteMutation();
  const [blockedChannels, setBlockedChannels] = useAtom(blockedChannelsAtom);

  const isFavorited = data?.some(({ id: chId }) => chId === id);
  const isBlocked = blockedChannels.some(({ id: chId }) => chId === id);
  const isSmall = size === "sm";

  const toggleFavorite = () =>
    mutate([{ op: isFavorited ? "remove" : "add", channel_id: id }]);

  const toggleBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBlockedChannels(
      isBlocked
        ? blockedChannels.filter(({ id: chId }) => chId !== id)
        : [...blockedChannels, { id, name, english_name, type, photo }],
    );
  };

  // Social media buttons
  const socialButtons = (
    <>
      <Button
        className={cn(
          "text-[#282828] dark:text-white",
          isSmall && "hidden md:flex",
        )}
        size="icon-lg"
        variant={isSmall ? "ghost" : "ghost"}
        asChild
      >
        <Link
          to={`https://www.youtube.com/channel/${id}`}
          target={isSmall ? undefined : "_blank"}
        >
          <div className="text-3xl i-mdi:youtube" />
        </Link>
      </Button>

      {twitter && (
        <Button
          className={isSmall ? "hidden md:flex" : ""}
          size="icon-lg"
          variant="ghost"
          asChild
        >
          <Link
            to={`https://x.com/${twitter}`}
            target={isSmall ? undefined : "_blank"}
          >
            <div className="i-mdi:twitter" />
          </Link>
        </Button>
      )}

      {twitch && (
        <Button
          className={isSmall ? "hidden md:flex" : ""}
          size="icon-lg"
          variant="ghost"
          asChild
        >
          <Link
            to={`https://twitch.tv/${twitch}`}
            target={isSmall ? undefined : "_blank"}
          >
            <div className="i-mdi:twitch" />
          </Link>
        </Button>
      )}
    </>
  );

  // Block button - always small icon style like social buttons
  const blockButton = (
    <Button
      size="icon-lg"
      variant="ghost"
      className={cn("group", isBlocked && "text-red-10")}
      onClick={toggleBlock}
      title={
        isBlocked
          ? t("component.channelSocials.unblock")
          : t("component.channelSocials.block")
      }
    >
      <div
        className={isBlocked ? "i-heroicons:eye" : "i-heroicons:eye-slash"}
      />
    </Button>
  );

  // Favorite button
  const favoriteButton = isSmall ? (
    <Button
      size="icon-lg"
      variant={isFavorited ? "ghost" : "secondary"}
      className={
        isFavorited
          ? "group text-red-10 hover:text-red-8 hover:saturate-50"
          : ""
      }
      onClick={toggleFavorite}
      disabled={isPending}
    >
      <div
        className={
          isFavorited
            ? "i-tabler:heart group-hover:i-tabler-heart-broken"
            : "i-tabler:heart-plus"
        }
      />
    </Button>
  ) : (
    <Button
      className="w-full group/fav"
      variant={isFavorited ? "outline" : "secondary"}
      disabled={isPending}
      onClick={toggleFavorite}
    >
      <div
        className={
          isFavorited
            ? "i-tabler:heart group-hover/fav:i-tabler-heart-broken inline-block"
            : "i-tabler:heart-plus inline-block"
        }
      />
      <span className="line-clamp-1 break-all">
        {isFavorited
          ? t("component.channelSocials.removeFromFavorites")
          : t("component.channelSocials.addToFavorites")}
      </span>
    </Button>
  );

  return isSmall ? (
    <div className="flex gap-2">
      {socialButtons}
      {blockButton}
      {favoriteButton}
    </div>
  ) : (
    <div className="flex w-full gap-2 flex-col">
      {favoriteButton}
      <div className="flex w-full gap-2">
        {socialButtons}
        {blockButton}
      </div>
    </div>
  );
}
