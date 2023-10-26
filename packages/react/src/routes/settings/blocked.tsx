import { blockedChannelsAtom } from "@/store/settings";
import { useAtom } from "jotai";

export default function SettingsBlocked() {
  const [blockedChannels, setBlockedChannels] = useAtom(blockedChannelsAtom);

  return <div className="flex flex-col gap-2"></div>;
}
