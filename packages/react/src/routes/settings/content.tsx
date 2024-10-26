import { SettingsItem } from "@/components/settings/SettingsItem";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import {
  defaultOpenAtom,
  hideCollabStreamsAtom,
  hidePlaceholderAtom,
  filterDeadStreamsAtom,
  filterLongStreamsAtom,
  blockedChannelsAtom,
} from "@/store/settings";
import { orgRankingAtom } from "@/store/org";
import { OrgReranker } from "./orgs";
import ToggleableFeatureGroup from "@/components/settings/ToggleableFeature";

export function SettingsContentPreferences() {
  const { t } = useTranslation();
  const [defaultOpen, setDefaultOpen] = useAtom(defaultOpenAtom);
  const [hideCollab, setHideCollab] = useAtom(hideCollabStreamsAtom);
  const [hidePlaceholder, setHidePlaceholder] = useAtom(hidePlaceholderAtom);
  const [filterDeadStreams, setFilterDeadStreams] = useAtom(
    filterDeadStreamsAtom,
  );
  const [filterLongStreams, setFilterLongStreams] = useAtom(
    filterLongStreamsAtom,
  );
  const [blockedChannels] = useAtom(blockedChannelsAtom);
  const [rankedOrgs, setRankedOrgs] = useAtom(orgRankingAtom);

  const defaultPages = [
    {
      value: "Home",
      label: t("views.settings.defaultHomepage.lastVisitedOrgHome"),
      icon: "i-lucide:home",
    },
    {
      value: "Favorites",
      label: t("views.settings.defaultHomepage.favoritesWhenLoggedIn"),
      icon: "i-heroicons:heart",
    },
  ] as const;

  const defaultPageFeatures = defaultPages.map(({ value, label, icon }) => ({
    id: `defaultPage-${value}`,
    checked: defaultOpen === value,
    onCheckedChange: () => setDefaultOpen(value),
    label,
    variant: "icon" as const,
    icon,
  }));

  const hideFeatures = [
    {
      id: "hide_collab",
      checked: hideCollab,
      onCheckedChange: () => setHideCollab(!hideCollab),
      label: t("views.settings.hideCollabStreamsLabel"),
      variant: "icon" as const,
      icon: "i-lucide:users",
    },
    {
      id: "hide_placeholder",
      checked: hidePlaceholder,
      onCheckedChange: () => setHidePlaceholder(!hidePlaceholder),
      label: t("views.settings.hidePlaceholderStreams"),
      variant: "icon" as const,
      icon: "i-lucide:calendar",
    },
    {
      id: "filter_dead_streams",
      checked: filterDeadStreams,
      onCheckedChange: () => setFilterDeadStreams(!filterDeadStreams),
      label: t("views.settings.filterDeadStreams"),
      variant: "icon" as const,
      icon: "i-uil:bed",
    },
    {
      id: "filter_long_streams",
      checked: filterLongStreams,
      onCheckedChange: () => setFilterLongStreams(!filterLongStreams),
      label: t("views.settings.filterLongStreams"),
      variant: "icon" as const,
      icon: "i-solar:infinity-linear",
    },
  ];

  return (
    <div className="flex flex-col">
      <SettingsItem label={t("views.settings.defaultPage")} fullWidth>
        <ToggleableFeatureGroup features={defaultPageFeatures} />
      </SettingsItem>

      <SettingsItem label={t("views.settings.orgs")} fullWidth>
        <OrgReranker rankedOrgs={rankedOrgs} setRankedOrgs={setRankedOrgs} />
      </SettingsItem>

      <SettingsItem label={t("views.settings.videoFilter")} fullWidth>
        <ToggleableFeatureGroup features={hideFeatures} showDividers />
      </SettingsItem>

      <SettingsItem label={t("views.settings.blockedChannels")} fullWidth>
        <div className="flex w-full justify-center">
          {blockedChannels.length ? (
            <div className="grid w-full grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))]">
              {blockedChannels.map((channel) => (
                <ChannelCard key={channel.id} size="lg" {...channel} />
              ))}
            </div>
          ) : (
            <div className="text-base-11">
              {t("views.channels.blockedAreEmpty")}
            </div>
          )}
        </div>
      </SettingsItem>
    </div>
  );
}
