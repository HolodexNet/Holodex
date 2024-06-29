import { useFavoriteMutation, useFavorites } from "@/services/user.service";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ChannelSocialsProps
  extends Pick<Channel, "id" | "twitter" | "twitch"> {
  size: "sm" | "lg";
}

export function ChannelSocials({
  size,
  id,
  twitter,
  twitch,
}: ChannelSocialsProps) {
  const { t } = useTranslation();
  const { data } = useFavorites();
  const { mutate, isPending } = useFavoriteMutation();

  const isFavorited = data?.some(({ id: chId }) => chId === id);

  switch (size) {
    case "sm":
      return (
        <div className="flex gap-2">
          {/* Youtube Logo needs to conform with YT guidelines https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors */}
          <Button
            className="hidden text-[#282828] dark:text-white md:flex"
            size="icon-lg"
            variant="ghost-yt"
            asChild
          >
            <Link to={`https://www.youtube.com/channel/${id}`}>
              <div className="i-mdi:youtube text-3xl" />
            </Link>
          </Button>
          {twitter && (
            <Button
              className="hidden md:flex"
              size="icon-lg"
              variant="ghost"
              asChild
            >
              <Link to={`https://x.com/${twitter}`}>
                <div className="i-mdi:twitter" />
              </Link>
            </Button>
          )}
          {twitch && (
            <Button
              className="hidden md:flex"
              size="icon-lg"
              variant="ghost"
              asChild
            >
              <Link to={`https://twitch.tv/${twitch}`}>
                <div className="i-mdi:twitch" />
              </Link>
            </Button>
          )}
          <Button
            size="icon-lg"
            variant={isFavorited ? "outline" : "secondary"}
            onClick={() =>
              mutate([{ op: isFavorited ? "remove" : "add", channel_id: id }])
            }
            disabled={isPending}
          >
            <div
              className={
                isFavorited ? "i-heroicons:heart-solid" : "i-heroicons:heart"
              }
            />
          </Button>
        </div>
      );

    case "lg":
      return (
        <div className="flex w-full flex-col gap-2">
          <Button
            className="w-full"
            variant={isFavorited ? "outline" : "secondary"}
            disabled={isPending}
            onClick={() => {
              mutate([
                {
                  op: isFavorited ? "remove" : "add",
                  channel_id: id,
                },
              ]);
              console.log(isFavorited);
            }}
          >
            {isFavorited ? (
              <div className="i-heroicons:heart-solid" />
            ) : (
              <div className="i-heroicons:heart" />
            )}
            {isFavorited
              ? t("component.channelSocials.removeFromFavorites")
              : t("component.channelSocials.addToFavorites")}
          </Button>
          <div className="flex w-full gap-2">
            <Button
              asChild
              className="w-full text-[#282828] dark:text-white"
              variant="ghost-yt"
              size="icon-lg"
            >
              {/* Youtube Logo needs to conform with YT guidelines https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors */}
              <Link
                to={`https://www.youtube.com/channel/${id}`}
                target="_blank"
              >
                <div className="i-mdi:youtube text-3xl" />
              </Link>
            </Button>
            {twitter && (
              <Button asChild className="w-full" variant="ghost" size="icon-lg">
                <Link to={`https://x.com/${twitter}`} target="_blank">
                  <div className="i-mdi:twitter" />
                </Link>
              </Button>
            )}
            {twitch && (
              <Button asChild className="w-full" variant="ghost" size="icon-lg">
                <Link to={`https://twitch.tv/${twitch}`} target="_blank">
                  <div className="i-mdi:twitch" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      );

    default:
      break;
  }
}
