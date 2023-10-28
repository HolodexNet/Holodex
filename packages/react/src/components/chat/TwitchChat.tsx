import { darkAtom } from "@/hooks/useTheme";
import { useAtomValue } from "jotai";

interface TwitchChatProps {
  link: string;
}

export function TwitchChat({ link }: TwitchChatProps) {
  const dark = useAtomValue(darkAtom);
  const q = new URLSearchParams({
    parent: window.location.hostname,
    ...(dark && { darkpopout: "" }),
  }).toString();

  return (
    <iframe
      key={q}
      className="flex grow rounded-lg"
      src={`https://www.twitch.tv/embed/${link.match(
        /twitch.tv\/(.*?)$/,
      )?.[1]}/chat?${q}`}
    />
  );
}
