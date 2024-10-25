import { SettingsItem } from "@/components/settings/SettingsItem";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Label } from "@/shadcn/ui/label";
import { cn } from "@/lib/utils";
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

  return (
    <div className="flex flex-col">
      <SettingsItem label={t("views.settings.defaultPage")} fullWidth>
        <div className="flex flex-col gap-2">
          {defaultPages.map(({ value, label, icon }) => (
            <div
              key={"defaultPage-" + value}
              className="flex items-center gap-3"
            >
              <Checkbox
                checked={defaultOpen === value}
                onCheckedChange={() => setDefaultOpen(value)}
                id={`defaultPage-${value}`}
              />
              <Label
                htmlFor={`defaultPage-${value}`}
                className={cn("flex cursor-pointer items-center gap-1", {
                  "opacity-70": defaultOpen !== value,
                })}
              >
                <div className={icon}></div>
                <span>{label}</span>
              </Label>
            </div>
          ))}
        </div>
      </SettingsItem>

      <SettingsItem label={t("views.settings.orgs")} fullWidth>
        <OrgReranker rankedOrgs={rankedOrgs} setRankedOrgs={setRankedOrgs} />
      </SettingsItem>

      <SettingsItem label={t("views.settings.hideFeaturesLabel")} fullWidth>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="hide_collab"
              checked={hideCollab}
              onCheckedChange={() => setHideCollab(!hideCollab)}
            />
            <Label
              htmlFor="hide_collab"
              className={cn({ "opacity-70": !hideCollab })}
            >
              {t("views.settings.hideCollabStreamsLabel")}
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="hide_placeholder"
              checked={hidePlaceholder}
              onCheckedChange={() => setHidePlaceholder(!hidePlaceholder)}
            />
            <Label
              htmlFor="hide_placeholder"
              className={cn({ "opacity-70": !hidePlaceholder })}
            >
              {t("views.settings.hidePlaceholderStreams")}
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="filter_dead_streams"
              checked={filterDeadStreams}
              onCheckedChange={() => setFilterDeadStreams(!filterDeadStreams)}
            />
            <Label
              htmlFor="filter_dead_streams"
              className={cn({ "opacity-70": !filterDeadStreams })}
            >
              {t("views.settings.filterDeadStreams")}
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="filter_long_streams"
              checked={filterLongStreams}
              onCheckedChange={() => setFilterLongStreams(!filterLongStreams)}
            />
            <Label
              htmlFor="filter_long_streams"
              className={cn({ "opacity-70": !filterLongStreams })}
            >
              {t("views.settings.filterLongStreams")}
            </Label>
          </div>
        </div>
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
