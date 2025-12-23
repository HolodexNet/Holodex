import { formatCount } from "@/lib/numbers";
// import { Button } from "@/shadcn/ui/button";
import { ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
// import { ChannelMenu } from "./ChannelMenu";
import { ChannelImg } from "./ChannelImg";
import { TopicBadge } from "../topic/TopicBadge";
import { ChannelSocials } from "./ChannelSocials";
import { Link, useNavigate } from "react-router-dom";
import { blockedSetAtom, usePreferredName } from "@/store/settings";
import React from "react";
import { useAtomValue } from "jotai";

type WithNonOptional<T, NonOptionalKeys extends keyof T> = Pick<
  T,
  NonOptionalKeys
> &
  Partial<Omit<T, NonOptionalKeys>>;
type PartialChannel = WithNonOptional<
  Channel,
  keyof ShortChannel | "subscriber_count" | "video_count"
>;

interface ChannelCardProps extends PartialChannel {
  size: "xs" | "sm" | "md" | "lg";
  variant: "card" | "list";
  showSubscribers?: boolean;
  showVideoCount?: boolean;
  showClipCount?: boolean;
  children?: ReactNode;
}

export const MemoizedChannelCard = React.memo(ChannelCard);
export function ChannelCard({
  size,
  variant,
  showSubscribers = true,
  showVideoCount,
  showClipCount,
  children,
  id,
  name,
  english_name,
  org,
  group,
  lang,
  type,
  photo,
  subscriber_count,
  video_count,
  clip_count,
  top_topics,
  twitter,
  twitch,
  inactive,
}: ChannelCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const channelHref = `/channel/${id}`;

  const goToChannelClickHandler = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if ((evt.target as HTMLElement).closest("a")) {
        console.info("no action b/c closest element is a link.", evt);
        return;
      }
      console.info("JS video click handling", evt);
      // clicked a non-link part of the channel card.
      if (evt.ctrlKey) {
        /** Control clicking a non-link part always goes to the external link no matter what the context */
        window.open(channelHref, "_blank");
        evt.preventDefault();
        evt.stopPropagation();
      } else {
        navigate(channelHref);
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    [channelHref, navigate],
  );

  const preferredName = usePreferredName({
    name,
    english_name,
  });

  const blockedChannelSet = useAtomValue(blockedSetAtom);
  const isBlocked = blockedChannelSet.has(id);

  switch (variant) {
    case "list":
      return (
        <div
          className="flex gap-2 transition-all rounded-lg items-center md:gap-4 bg-card p-2 md:p-4 hover:cursor-pointer"
          onClick={goToChannelClickHandler}
        >
          <Link
            to={channelHref}
            className="flex items-center gap-2 md:gap-4 grow"
          >
            <div className="relative">
              <ChannelImg
                className={[
                  "h-12 w-auto md:h-20 lg:h-24",
                  inactive && "opacity-80 saturate-50",
                  isBlocked && "opacity-80 saturate-50 blur-md",
                ]}
                channelId={id}
              />
              {isBlocked && (
                <div className="flex items-center absolute inset-0 justify-center">
                  <div className="text-2xl text-muted-foreground i-heroicons:eye-slash" />
                </div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="text-xs">
                {org}
                {group && ` / ${group}`}
              </div>
              <div className="line-clamp-1 text-lg font-bold">
                {preferredName}
              </div>
              <div className="text-sm">
                {showSubscribers &&
                  t("component.channelInfo.subscriberCount", {
                    n: formatCount(subscriber_count ?? "0"),
                  })}
                {showVideoCount &&
                  ` / ${t("component.channelInfo.videoCount", {
                    0: video_count ?? "0",
                  })}`}
                {showClipCount &&
                  ` / ${t("component.channelInfo.clipCount", {
                    n: clip_count ?? "0",
                  })}`}
              </div>
              {size === "sm" && (
                <div className="flex mt-1 max-w-full gap-1 overflow-x-hidden">
                  {top_topics?.map((topic) => (
                    <TopicBadge
                      size="sm"
                      topic={topic}
                      className="capitalize"
                    />
                  ))}
                </div>
              )}
            </div>
          </Link>
          {children ?? (
            <ChannelSocials
              size="sm"
              id={id}
              name={name}
              english_name={english_name}
              type={type}
              photo={photo}
              twitter={twitter}
              twitch={twitch}
            />
          )}
        </div>
      );

    case "card":
      return (
        // Set min-height because react-virtuoso will break if the height is not fixed
        <div
          className={
            "flex w-full flex-col bg-card items-center gap-2 p-4 transition-all  group relative h-full min-h-96 rounded-md" +
            " hover:bg-[color-mix(in_oklch,var(--card)_97%,var(--foreground))] hover:ring hover:ring-secondary hover:cursor-pointer " +
            (inactive && " text-muted-foreground")
          }
          onClick={goToChannelClickHandler}
        >
          <Link
            to={channelHref}
            className="flex grow flex-col items-center gap-2"
          >
            {/* <ChannelMenu
              {...{
                id,
                name,
                type,
                english_name,
                org,
                group,
                lang,
                photo,
              }}
            >
              <Button
                size="icon-lg"
                variant="ghost"
                className="absolute right-4 top-4 hidden rounded-full group-hover:flex"
              >
                <div className="i-heroicons:ellipsis-vertical" />
              </Button>
            </ChannelMenu> */}
            {
              <ChannelImg
                className={[
                  "-z-0 -mb-36 mt-4 h-32 w-32 opacity-20 blur-2xl saturate-150",
                  inactive || (isBlocked && "opacity-0"),
                ]}
                channelId={id}
              />
            }
            <div className="relative z-10">
              <ChannelImg
                className={[
                  "h-24 w-24",
                  inactive && "opacity-80 saturate-50",
                  isBlocked && "opacity-80 saturate-50 blur-md",
                ]}
                channelId={id}
              />
              {isBlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="i-heroicons:eye-slash text-muted-foreground text-3xl" />
                </div>
              )}
            </div>
            <div
              className={`z-10 line-clamp-2 min-h-[2lh] text-center text-lg font-bold`}
            >
              {preferredName}
            </div>
            <div className="flex flex-col items-center">
              <div className="text-sm whitespace-nowrap">
                {t("component.channelInfo.subscriberCount", {
                  n: formatCount(subscriber_count ?? "0"),
                })}
              </div>
              <div className="flex text-sm justify-center flex-wrap gap-x-1 gap-y-0">
                <span className="whitespace-nowrap">
                  {t("component.channelInfo.videoCount", {
                    0: video_count ?? 0,
                  })}
                </span>
                <span>/</span>
                <span className="whitespace-nowrap">
                  {t("component.channelInfo.clipCount", {
                    n: clip_count ?? "0",
                  })}
                </span>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-0.5">
              {top_topics?.map((topic) => (
                <TopicBadge size="sm" topic={topic} className="capitalize" />
              ))}
            </div>
          </Link>

          {children ?? (
            <ChannelSocials
              size="lg"
              id={id}
              name={name}
              english_name={english_name}
              type={type}
              photo={photo}
              twitter={twitter}
              twitch={twitch}
            />
          )}
        </div>
      );
  }
}
