import { useSiteStore } from "@/stores";
import { musicdexURL } from "@/utils/consts";
import {
  mdiFileDocumentMultiple,
  mdiNoteEdit,
  mdiRobot,
  mdiTypewriter,
} from "@/utils/icons";
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
      icon: mdiTypewriter,
      collapsible: true,
      extra: true,
    },
    {
      name: "Script Editor",
      path: "/scripteditor",
      icon: mdiNoteEdit,
      collapsible: true,
      extra: true,
    },
    {
      name: "Script Manager",
      path: "/scriptmanager",
      icon: mdiFileDocumentMultiple,
      collapsible: true,
      extra: true,
    },
    {
      name: "Relay Bot Setting",
      path: "/relaybot",
      icon: mdiRobot,
      collapsible: true,
      extra: true,
    },
  ];
}
