import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/ui/collapsible";
import { LiveChat } from "../chat/LiveChat";
import { Button } from "@/shadcn/ui/button";
import { TLChat } from "../tldex/TLChat";
import { useAtom } from "jotai";
import { chatOpenAtom, tlOpenAtom } from "@/store/player";
import { useStateList } from "react-use";
import { WATCH_PAGE_DROPDOWN_BUTTON_STYLE } from "@/shadcn/ui/button.variants";

const CHAT_SIZES_ITER = [1, 1.6, 2, 2.5, 0.3, 0.6, 0.8];

export function ChatCard({
  id,
  status,
  channel,
  link,
}: Pick<PlaceholderVideo, "id" | "status" | "channel" | "link">) {
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTlOpen] = useAtom(tlOpenAtom);
  const { state: chatBasis, next: nextChatBasis } =
    useStateList(CHAT_SIZES_ITER);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-base bg-base-3">
      <Collapsible
        open={chatOpen}
        className={cn("flex flex-col bg-base-3")}
        style={{ flexGrow: chatOpen ? (tlOpen ? chatBasis : 1) : 0 }}
      >
        <CollapsibleTrigger asChild>
          <Button
            size="lg"
            variant="ghost"
            className={WATCH_PAGE_DROPDOWN_BUTTON_STYLE}
            onClick={() => setChatOpen((v) => !v)}
          >
            <div
              className={chatOpen ? "i-heroicons:minus" : "i-heroicons:plus"}
            />
            {"Chat"}

            {chatOpen && (
              <Button
                size="icon"
                variant="ghost"
                className="ml-auto hover:bg-primary-6"
                onClick={(e) => {
                  e.stopPropagation();
                  nextChatBasis();
                }}
              >
                <div className="i-fluent:arrow-autofit-height-dotted-24-regular"></div>
              </Button>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <div className="flex grow">
            <LiveChat
              id={id}
              status={status}
              channelId={channel.id}
              link={link}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        open={tlOpen}
        className={cn("flex flex-col", {
          grow: tlOpen,
        })}
      >
        <CollapsibleTrigger asChild>
          <Button
            size="lg"
            variant="ghost"
            className={WATCH_PAGE_DROPDOWN_BUTTON_STYLE}
            onClick={() => setTlOpen((v) => !v)}
          >
            <div
              className={tlOpen ? "i-heroicons:minus" : "i-heroicons:plus"}
            />
            {"TLdex"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <div className="flex grow">
            <TLChat videoId={id} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
