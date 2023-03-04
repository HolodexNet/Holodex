import { useSiteStore } from "@/stores";
import { musicdexURL } from "@/utils/consts";
import { useI18n } from "vue-i18n";

export function usePages() {
  const { t } = useI18n();
  const site = useSiteStore();
  return [
    {
      routeName: "Home_Org",
      name: t("component.mainNav.home"),
      path: "/org/" + site.currentOrg.name,
      icon: "i-material-symbols:home-storage-rounded",
    },
    {
      routeName: "Favorites",
      name: t("component.mainNav.favorites"),
      path: "/favorites",
      icon: "i-material-symbols:favorite-rounded",
    },
    {
      name: t("component.mainNav.channels"),
      path: `/channels`,
      icon: "i-ion:people",
      routeName: "Channels_Org",
    },
    {
      name: t("component.mainNav.playlist"),
      path: "/playlists",
      icon: "i-material-symbols:playlist-play-rounded",
      divider: true,
    },
    {
      name: t("component.mainNav.multiview"),
      path: "/multiview",
      icon: "i-clarity:grid-chart-solid",
      collapsible: true,
    },
    {
      name: "Musicdex",
      path: musicdexURL,
      icon: "i-mdi:music-clef-treble",
      collapsible: true,
      divider: true,
    },
    {
      name: t("component.mainNav.settings"),
      path: "/settings",
      icon: "i-material-symbols:settings-rounded",
      collapsible: true,
    },
    {
      name: t("component.mainNav.about"),
      path: "/about",
      icon: "i-ion:information-circle-outline",
      collapsible: true,
    },
    {
      name: "TL client",
      path: "/tlclient",
      icon: "i-bi:terminal",
      collapsible: true,
      extra: true,
    },
    {
      name: "Script Editor",
      path: "/scripteditor",
      icon: "i-uil:file-edit-alt",
      collapsible: true,
      extra: true,
    },
    {
      name: "Script Manager",
      path: "/scriptmanager",
      icon: "i-mdi:file-arrow-up-down",
      collapsible: true,
      extra: true,
    },
    {
      name: "Relay Bot Setting",
      path: "/relaybot",
      icon: "i-mdi:robot-industrial",
      collapsible: true,
      extra: true,
    },
  ].map(page => Object.assign(page, /^https?:\/\//.test(page.path) ? { isAbsolute: true } : {}));
}
