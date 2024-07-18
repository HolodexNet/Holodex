import { InlayContainer } from "@/components/layout/InlayContainer";
import useAlwaysShowScrollbar from "@/hooks/useAlwaysShowScrollbar";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
export function About() {
  const { t } = useTranslation();
  useAlwaysShowScrollbar();

  const routes = useMemo(
    () => [
      {
        label: t("about.general.title"),
        href: "/about/general",
        icon: "i-heroicons:information-circle",
      },
      {
        label: t("about.changelog.title"),
        href: "/about/changelog",
        icon: "i-heroicons:swatch",
      },
      {
        label: t("about.faq.title"),
        href: "/about/faq",
        icon: "i-heroicons:chat-bubble-left-right",
      },
      {
        label: t("views.about.add_my_channel"),
        href: "/about/request",
        icon: "i-heroicons:sparkles",
      },
      {
        label: t("about.placeholder.title"),
        href: "/about/placeholder",
        icon: "i-tabler:timeline-event-plus",
      },
      {
        label: t("about.extensions.title"),
        href: "/about/extensions",
        icon: "i-heroicons:bolt",
      },
      {
        label: t("about.contact.title"),
        href: "/about/contact",
        icon: "i-heroicons:envelope",
      },
      {
        label: t("about.privacy.title"),
        href: "/about/privacy",
        icon: "i-heroicons:shield-check",
      },
    ],
    [t],
  );

  return (
    <>
      <Helmet>
        <title>{t("component.mainNav.about")} - Holodex</title>
      </Helmet>
      <InlayContainer routes={routes} />
    </>
  );
}

export { AboutGeneral } from "./general";
export { AboutChangelog } from "./changelog";
export { AboutFaq } from "./faq";
// export { AboutRequest } from "./request";
// export { AboutPlaceholder } from "./placeholder";
export { AboutExtensions } from "./extensions";
export { AboutContact } from "./contact";
export { AboutPrivacy } from "./privacy";
