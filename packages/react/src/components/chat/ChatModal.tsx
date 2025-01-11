import { cn } from "@/lib/utils";
import { useEventListener } from "usehooks-ts";
import { useCallback, useState } from "react";
import { ChatCard } from "../player/ChatCard";
import { chatOpenAtom, tlOpenAtom } from "@/store/player";
import { useAtom } from "jotai";

interface ChatModalProps
  extends Pick<PlaceholderVideo, "id" | "status" | "channel" | "link"> {
  tlOpen: boolean;
  chatOpen: boolean;
}

export function ChatModal({ ...data }: ChatModalProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTlOpen] = useAtom(tlOpenAtom);

  useEventListener(
    "scroll",
    useCallback(() => {
      setScrollTop(window.scrollY);
    }, [setScrollTop]),
  );

  return (
    <div
      className={cn(
        "flex w-full rounded-t-lg bg-base transition-all will-change-transform starting:h-0 starting:translate-y-full lg:hidden",
        // use top-[...] and h-[...] for fixed chat modal
        // since container query disables fixed element on screen (cannot use bottom-0)
        // Top position: top padding (1rem) + video height ((100cqw - x padding) * 0.5625) + controlbar height (4rem?)
        // Height: 100dvh - header height - $(top-position)
        "fixed top-0",
        { hidden: !chatOpen && !tlOpen },
      )}
      style={{
        transitionDuration: "0.1s",
        transitionTimingFunction: "ease-in-out",
        // Height calculation: full screen, minus header, footer, "control bar (4rem)" and video height
        height:
          "calc(100dvh - (var(--header-height) + 4rem + (100cqw - 2rem) * 0.5625 + var(--footer-height-clearance)))",
        // translateY: $(top-position) + scrollY
        // offset the top position by scrollY making it hide when you move.
        // default offset at 0 scroll is moving it down by <header>, <footer>, and <control bar> height
        transform: `translateY(calc(4rem + (100cqw - 2rem) * 0.5625 + 4rem + ${Math.max(0, scrollTop - 12) * 5}px))`,
      }}
    >
      {data && (
        // <LiveChat
        //   id={data.id}
        //   status={data?.status}
        //   channelId={data.channelId}
        //   link={data.link}
        // />
        <ChatCard {...data} />
      )}
    </div>
  );
}
