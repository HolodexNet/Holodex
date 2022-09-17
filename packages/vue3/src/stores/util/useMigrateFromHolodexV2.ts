import { useLangStore } from "../lang";
import { useSettingsStore } from "../settings";
import { useSiteStore } from "../site";

const DELETE_MIGRATION_RESULT = false;
// TODO productionization: turn this to true.

function clearV2Settings() {
  if (DELETE_MIGRATION_RESULT) localStorage.removeItem("holodex-v2");
}

export function useMigrateFromHolodexV2() {
  // migration:
  setTimeout(() => {
    const settingsString = localStorage.getItem("holodex-v2");
    if (!settingsString) return;
    const v2 = JSON.parse(settingsString);

    if (v2?.migration?.version !== 9) {
      console.error("Abandon Migration: old settings are not latest version.");
      // clearV2Settings();
      return;
    }

    const site = useSiteStore();
    const lang = useLangStore();
    const settings = useSettingsStore();

    site.starredOrgs = v2.orgFavorites; // migrate straight.
    site.jwtToken = v2.userdata.jwt;
    site.user = v2.userdata.user;

    lang.lang = v2.settings.lang;
    lang.clipLangs = v2.settings.clipLangs;
    lang.useEnglishName = v2.settings.nameProperty == "english_name";

    settings.redirectMode = v2.settings.redirectMode;
    settings.hideThumbnail = v2.settings.hideThumbnail;
    settings.hidePlaceholder = v2.settings.hidePlaceholder;
    settings.hideCollabStreams = v2.settings.hideCollabStreams;
    settings.ignoredTopics = v2.settings.ignoredTopics;
    settings.blockedChannels = v2.settings.blockedChannels;
    clearV2Settings();
  }, 0);
}
