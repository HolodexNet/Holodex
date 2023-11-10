import { InlayContainer } from "@/components/layout/InlayContainer";
import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
export default function About() {
  const { t } = useTranslation();

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
        icon: "i-heroicons:sparkles",
      },
      {
        label: t("about.faq.title"),
        href: "/about/faq",
        icon: "i-heroicons:chat-bubble-left-right",
      },
      {
        label: t("views.about.add_my_channel"),
        href: "/about/request",
        icon: "i-heroicons:pencil-square",
      },
      {
        label: t("about.placeholder.title"),
        href: "/about/placeholder",
        icon: "i-heroicons:calendar-days",
      },
      {
        label: t("about.extensions.title"),
        href: "/about/extensions",
        icon: "i-heroicons:puzzle-piece",
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
