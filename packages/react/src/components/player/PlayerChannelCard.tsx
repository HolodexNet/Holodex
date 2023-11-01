import { formatCount } from "@/lib/time";
import { useChannel } from "@/services/channel.service";
import { useFavoriteMutation, useFavorites } from "@/services/user.service";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function PlayerChannelCard({ id }: { id?: string }) {
  const { t } = useTranslation();
  const { data } = useChannel(id ?? "", { enabled: !!id });

  if (!data) return;

  console.log(data);

  return (
    <div className="bg-base-4 flex w-full items-center gap-4 rounded-lg px-4 py-2">
      <Link className="flex grow gap-4" to={`/channel/${id}`}>
        <img className="h-12 w-12 rounded-full" src={data.photo} />
        <div className="flex flex-col">
          <span className="line-clamp-1 text-lg font-bold">{data?.name}</span>
          {data.org && data.group && (
            <span className="text-base-11 line-clamp-1 text-sm">
              {data.org} / {data.group}
            </span>
          )}
          {data.subscriber_count && (
            <span className="text-base-11 line-clamp-1 text-sm">
              {t("component.channelInfo.subscriberCount", {
                n: formatCount(data.subscriber_count),
              })}
            </span>
          )}
        </div>
      </Link>
      <ChannelCardSocial {...data} />
    </div>
  );
}

function ChannelCardSocial({ id, twitter, twitch }: Channel) {
  const { data } = useFavorites();
  const { mutate, isPending } = useFavoriteMutation();

  const isFavorited = data?.some(({ id: chId }) => chId === id);

  return (
    <div className="flex gap-2">
      <Button className="hidden md:flex" size="icon-lg" variant="ghost" asChild>
        <Link to={`https://www.youtube.com/channel/${id}`}>
          <div className="i-mdi:youtube" />
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
            <div className="i-lucide:twitter" />
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
            <div className="i-lucide:twitch" />
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
}
