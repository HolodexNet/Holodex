import { cn } from "@/lib/utils";

interface LiveStreamInfoProps {
  thumbnailLink?: string;
  altText?: string;
  streamTitle?: string;
  channelName?: string;
  topicId?: string;
  isVisible: boolean;
}

export function LiveStreamInfo({
  thumbnailLink,
  altText,
  streamTitle,
  channelName,
  topicId,
  isVisible,
}: LiveStreamInfoProps) {
  return (
    <div
      className={cn(
        // currently hardcoded a translate value, will investigate to find a better way
        " absolute flex translate-x-[-118px] translate-y-2 flex-col rounded-md bg-base-6 opacity-80",
        {
          visible: isVisible,
          invisible: !isVisible,
        },
      )}
    >
      <div className="relative flex w-full flex-col items-center px-4 py-2">
        <img
          className="rounded-lg h-auto w-64"
          src={thumbnailLink}
          alt={altText}
        />
        <p className="absolute z-30 px-1 text-white opacity-80 left-4 top-2 bg-black py-0.5">
          {topicId}
        </p>
      </div>
      <div>
        <p>{streamTitle}</p>
        <p>{channelName}</p>
        <p>status</p>
      </div>
    </div>
  );
}
