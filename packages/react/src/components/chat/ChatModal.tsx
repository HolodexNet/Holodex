import { cn } from "@/lib/utils";
import { LiveChat, LiveChatProps } from "./LiveChat";
import { useEventListener } from "usehooks-ts";
import { useState } from "react";

interface ChatModalProps extends LiveChatProps {
  tlOpen: boolean;
  chatOpen: boolean;
}

export function ChatModal({ tlOpen, chatOpen, ...data }: ChatModalProps) {
  const [scrollTop, setScrollTop] = useState(0);

  useEventListener("scroll", () => setScrollTop(window.scrollY));

  return (
    <div
      className={cn(
        "flex w-full rounded-t-lg bg-base will-change-transform @screen-lg:hidden",
        // use top-[...] and h-[...] for fixed chat modal
        // since container query disables fixed element on screen (cannot use bottom-0)
        // Top position: top padding (1rem) + video height ((100cqw - x padding) * 0.5625) + controlbar height (4rem?)
        // Height: 100dvh - header height - $(top-position)
        "fixed top-0",
        "h-[calc(100dvh_-_(var(--header-height)_+_1rem_+_(100cqw_-_2rem)_*_0.5625_+_4rem))]",
        { hidden: !chatOpen && !tlOpen },
      )}
      style={{
        // translateY: $(top-position) + scrollY
        transform: `translateY(calc(1rem + (100cqw - 2rem) * 0.5625 + 4rem + ${scrollTop}px))`,
      }}
    >
      {data && (
        <LiveChat
          id={data.id}
          status={data?.status}
          channelId={data.channelId}
          link={data.link}
        />
      )}
    </div>
  );
}
