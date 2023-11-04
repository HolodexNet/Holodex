import { useTranslation } from "react-i18next";
import { TwitchChat } from "./TwitchChat";
import { YTChat } from "./YTChat";
import { Link } from "react-router-dom";

declare global {
  // eslint-disable-next-line  no-var
  var ARCHIVE_CHAT_OVERRIDE: string;
}

export interface LiveChatProps {
  id: string;
  status: VideoStatus;
  channelId: string;
  currentTime?: number;
  link?: string;
}

export function LiveChat({
  id,
  status,
  channelId,
  currentTime,
  link,
}: LiveChatProps) {
  const { t } = useTranslation();
  const needExtension = !window.ARCHIVE_CHAT_OVERRIDE && status === "past";

  if (needExtension)
    return (
      <div className="flex h-full items-center justify-center p-4">
        <span className="text-center text-sm">
          {t("views.watch.chat.archiveNeedExtension", {
            0: (
              <Link
                key="holodex"
                className="text-secondary-11 underline"
                to="/about/extensions"
              >
                Holodex+
              </Link>
            ),
          })}
        </span>
      </div>
    );

  return link?.includes("twitch") ? (
    <TwitchChat link={link} />
  ) : (
    <YTChat
      id={id}
      status={status}
      channelId={channelId}
      currentTime={currentTime}
    />
  );
}
