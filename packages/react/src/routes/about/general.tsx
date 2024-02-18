import { AboutDescription } from "@/components/about/Description";
import { AboutHeading } from "@/components/about/Heading";
import { QuickLink, QuickLinkProps } from "@/components/about/QuickLink";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function AboutGeneral() {
  const { t } = useTranslation();

  const quickLinks: QuickLinkProps[] = useMemo(
    () => [
      {
        className:
          "border-blue-11 hover:bg-blue-4 hover:border-blue-11 text-blue-11",
        href: "https://twitter.com/holodex",
        icon: "i-lucide:twitter",
        label: t("about.quicklink.twitter"),
      },
      {
        className:
          "border-blue-500 hover:bg-blue-4 hover:border-blue-500 text-blue-500",
        href: "https://ko-fi.com/holodex",
        icon: "i-cib:ko-fi",
        label: t("about.quicklink.ko-fi"),
      },
      {
        className:
          "border-secondary-11 hover:bg-secondary-4 hover:border-secondary-11 text-secondary-11",
        href: "https://github.com/HolodexNet/Holodex",
        icon: "i-lucide:github",
        label: t("about.quicklink.github"),
      },
      {
        className:
          "border-orange-10 hover:bg-orange-4 hover:border-orange-10 text-orange-10",
        href: "https://docs.holodex.net/docs/holodex/f4e6fa31af431-getting-started",
        icon: "i-lucide:file-code",
        label: t("about.quicklink.apiDocs"),
      },
      {
        className:
          "border-violet-10 hover:bg-violet-4 hover:border-violet-10 text-violet-10",
        href: "https://discord.gg/A24AbzgvRJ",
        icon: "i-carbon:logo-discord",
        label: t("about.discordBtn"),
      },
    ],
    [t],
  );

  return (
    <article className="w-full">
      <AboutHeading>{t("about.general.summary.title")}</AboutHeading>
      <AboutDescription>{t("about.general.summary.0")}</AboutDescription>
      <AboutDescription>{t("about.general.summary.1")}</AboutDescription>
      <AboutDescription>{t("about.general.summary.2")}</AboutDescription>
      <AboutHeading>{t("about.quicklinks")}</AboutHeading>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4 pt-2">
        {quickLinks.map((link) => (
          <QuickLink key={link.href} {...link} />
        ))}
      </div>
      <hr className="mt-4 border-base"></hr>
      <AboutHeading>{t("about.credits.title")}</AboutHeading>
      <AboutDescription>{t("about.general.credits.0")}</AboutDescription>
      <AboutDescription>{t("about.general.credits.1")}</AboutDescription>
      <ul className="list-inside list-disc pt-1">
        <li>RiceCakes (creator, admin)</li>
        <li>Xrave (admin)</li>
        <li>Uetchy (dev, designer)</li>
        <li>MadeT (designer)</li>
        <li>NeloBlivion (twitch support, editor)</li>
        <li className="opacity-60">
          <small>{t("about.general.credits.addRequest")}</small>
        </li>
      </ul>
    </article>
  );
}
