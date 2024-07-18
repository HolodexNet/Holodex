import { ChannelCard } from "@/components/channel/ChannelCard";
import { SettingsItem } from "@/components/settings/SettingsItem";
import { blockedChannelsAtom } from "@/store/settings";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

export function SettingsBlocked() {
  const { t } = useTranslation();
  // const [blockedChannels, setBlockedChannels] = useAtom(blockedChannelsAtom);
  const blockedChannels = useAtomValue(blockedChannelsAtom);

  return (
    <div className="flex flex-col gap-2">
      <SettingsItem label={t("views.settings.blockedChannels")} fullWidth>
        <div className="flex w-full justify-center">
          {blockedChannels.length ? (
            <div className="grid w-full grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] ">
              {blockedChannels.map((channel) => (
                <ChannelCard size="lg" {...channel} />
              ))}
            </div>
          ) : (
            t("views.channels.blockedAreEmpty")
          )}
        </div>
      </SettingsItem>
    </div>
  );
}
