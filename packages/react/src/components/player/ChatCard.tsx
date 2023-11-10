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

export function ChatCard({ id, status, channel, link }: PlaceholderVideo) {
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTlOpen] = useAtom(tlOpenAtom);

  return (
    <div className="flex h-full w-full flex-col bg-base-3">
      <Collapsible
        open={chatOpen}
        className={cn("flex flex-col", {
          grow: chatOpen,
        })}
      >
        <CollapsibleTrigger asChild>
          <Button
            size="lg"
            variant="ghost"
            className="flex w-full justify-start rounded-none px-4 py-2"
            onClick={() => setChatOpen((v) => !v)}
          >
            <div
              className={chatOpen ? "i-heroicons:minus" : "i-heroicons:plus"}
            />
            {chatOpen ? "Close chat" : "Open chat"}
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
            className="flex w-full justify-start rounded-none px-4 py-2"
            onClick={() => setTlOpen((v) => !v)}
          >
            <div
              className={tlOpen ? "i-heroicons:minus" : "i-heroicons:plus"}
            />
            {tlOpen ? "Close TL" : "Open TL"}
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
