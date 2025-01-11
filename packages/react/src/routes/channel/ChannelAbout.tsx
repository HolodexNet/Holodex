import { useOutletContext } from "react-router-dom";
import { ChannelOutletContext } from "../channel";
import { useTranslation } from "react-i18next";
import { LinkItTwitter, LinkItUrl } from "react-linkify-it";

export default function ChannelAbout() {
  const { t } = useTranslation();
  const { channel } = useOutletContext<ChannelOutletContext>();

  return (
    <div className="container flex gap-4 py-4 max-sm:flex-col-reverse">
      <div className="w-full whitespace-pre-wrap rounded-lg bg-base-3 p-4">
        <LinkItUrl className="text-primary underline hover:text-primary-12">
          <LinkItTwitter className="text-primary underline hover:text-primary-12">
            {channel.description}
          </LinkItTwitter>
        </LinkItUrl>
      </div>
      <div className="h-fit w-full shrink-0 flex-col divide-y-2 divide-base-5 rounded-lg bg-base-3 p-4 md:w-80 [&>p]:py-2">
        <h3 className="pb-2 text-xl font-bold">
          {t("component.channelInfo.stats")}
        </h3>
        <p>
          {t("component.channelInfo.videoCount", {
            0: Number(channel.video_count).toLocaleString(),
          })}
        </p>
        <p>
          {t("component.channelInfo.clipCount", {
            n: Number(channel.clip_count).toLocaleString(),
          })}
        </p>
        <p>
          {Number(channel.view_count).toLocaleString()}
          {t("component.channelInfo.totalViews")}
        </p>
      </div>
    </div>
  );
}
