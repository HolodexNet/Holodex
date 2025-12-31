import { cn } from "@/lib/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import "./quicklinks.css";

interface StyledExternalLinkProps {
  href: string;
  icon: string;
  label: string;
  className?: string;
}

export const StyledExternalLink = ({
  href,
  icon,
  label,
  className,
  style,
}: StyledExternalLinkProps & { style?: React.CSSProperties }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        `focus: flex grow basis-1 items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-hidden`,
        className,
      )}
      style={style}
    >
      <span className={icon}></span>
      <span>{label}</span>
    </a>
  );
};

export const QuickLinks = () => {
  const { t } = useTranslation();

  const quickLinks = [
    {
      className: "quicklink quicklink-discord",
      href: "https://discord.gg/jctkgHBt4b",
      icon: "i-carbon:logo-discord",
      label: t("about.discordBtn"),
    },
    {
      className: "quicklink quicklink-twitter",
      href: "https://twitter.com/holodex",
      icon: "i-tabler:brand-twitter",
      label: t("about.quicklink.twitter"),
    },
    {
      className: "quicklink quicklink-github",
      href: "https://github.com/HolodexNet/Holodex",
      icon: "i-lucide:github",
      label: t("about.quicklink.github"),
    },
    {
      className: "quicklink quicklink-github",
      href: "https://docs.holodex.net/",
      icon: "i-mdi:cloud-json",
      label: t("about.quicklink.apiDocs"),
    },
    {
      className: "quicklink quicklink-kofi",
      href: "https://ko-fi.com/holodex",
      icon: "i-cib:ko-fi",
      label: t("about.quicklink.ko-fi"),
    },
  ];
  return (
    <div className="flex w-full flex-wrap gap-4 rounded-lg p-4">
      {quickLinks.map((link, index) => (
        <StyledExternalLink key={index} {...link} />
      ))}
    </div>
  );
};
