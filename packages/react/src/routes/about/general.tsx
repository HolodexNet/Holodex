import { AboutDescription } from "@/components/about/Description";
import { AboutHeading } from "@/components/about/Heading";
import StatComponent from "@/components/about/Stats";
import { Loading } from "@/components/common/Loading";
import { darkAtom } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

export function AboutGeneral() {
  const { t } = useTranslation();

  const dark = useAtomValue(darkAtom);

  return (
    <article className="w-full @container">
      <AboutHeading>{t("about.quicklinks")}</AboutHeading>
      <QuickLinks />
      <AboutHeading>{t("about.general.summary.title")}</AboutHeading>
      <AboutDescription>{t("about.general.summary.0")}</AboutDescription>
      <AboutDescription>{t("about.general.summary.1")}</AboutDescription>
      <AboutDescription>{t("about.general.summary.2")}</AboutDescription>
      <AboutHeading>{t("component.channelInfo.stats")}</AboutHeading>
      <StatsBlock></StatsBlock>
      <AboutHeading className="mt-6">{t("about.credits.title")}</AboutHeading>
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
      <AboutDescription>
        {dark ? (
          <img
            src="https://developers.google.com/static/youtube/images/developed-with-youtube-sentence-case-light.png"
            className="w-80"
          ></img>
        ) : (
          <img
            src="https://developers.google.com/static/youtube/images/developed-with-youtube-sentence-case-dark.png"
            className="w-80"
          ></img>
        )}
      </AboutDescription>
    </article>
  );
}

interface Metrics {
  statistics: {
    channelCount: {
      vtuber?: number;
      subber?: number;
    };
    monthlyChannels: {
      vtuber?: number;
      subber?: number;
    };
    totalVideos: {
      count?: number;
    };
    dailyVideos: {
      count?: number;
    };
    totalSongs: {
      count?: number;
    };
  };
}
function StatsBlock() {
  const { data: stats, isSuccess } = useQuery<Metrics>({
    queryKey: ["stats"],
    queryFn: () => fetch("/statics/stats.json").then((res) => res.json()),
    staleTime: 50000,
  });

  if (!isSuccess || !stats) {
    // return a loading state using Shadcn
    return (
      <div>
        <Loading size="lg"></Loading>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full min-w-min grid-cols-1 gap-4 @md:max-w-2xl @md:grid-cols-2 @lg:max-w-4xl">
      <StatComponent
        title={"Vtubers"}
        amount={stats.statistics.channelCount.vtuber || 0}
        change={stats.statistics.monthlyChannels.vtuber || 0}
        duration={1000}
        timeText="last month"
      />
      <StatComponent
        title={"Subbers"}
        amount={stats.statistics.channelCount.subber || 0}
        change={stats.statistics.monthlyChannels.subber || 0}
        duration={1000}
        timeText="last month"
      />
      <StatComponent
        title={"Videos"}
        amount={stats.statistics.totalVideos.count || 0}
        change={stats.statistics.dailyVideos.count || 0}
        duration={1000}
        timeText="last day"
      />
      <StatComponent
        title={"Songs"}
        amount={stats.statistics.totalSongs.count || 0}
        duration={1000}
      />
    </div>
  );
}

export const QuickLinks = () => {
  const { t } = useTranslation();

  const quickLinks = [
    {
      className:
        "border-violet-10 hover:bg-violet-4 hover:border-violet-10 text-violet-10",
      href: "https://discord.gg/A24AbzgvRJ",
      icon: "i-carbon:logo-discord",
      label: t("about.discordBtn"),
    },
    {
      className:
        "border-blue-11 hover:bg-blue-4 hover:border-blue-11 text-blue-11",
      href: "https://twitter.com/holodex",
      icon: "i-tabler:brand-twitter",
      label: t("about.quicklink.twitter"),
    },
    {
      className:
        "border-gray-11 hover:bg-gray-4 hover:border-gray-11 text-gray-11",
      href: "https://github.com/HolodexNet/Holodex",
      icon: "i-lucide:github",
      label: t("about.quicklink.github"),
    },
    {
      className:
        "border-orange-10 hover:bg-orange-4 hover:border-orange-10 text-orange-10",
      href: "https://docs.holodex.net/",
      icon: "i-mdi:cloud-json",
      label: t("about.quicklink.apiDocs"),
    },
    {
      className:
        "border-red-500 hover:bg-red-4 hover:border-red-500 text-red-500",
      href: "https://ko-fi.com/holodex",
      icon: "i-cib:ko-fi",
      label: t("about.quicklink.ko-fi"),
    },
  ];

  return (
    <div className="flex w-full flex-wrap gap-4 rounded-lg bg-base-2 p-4">
      {quickLinks.map((link, index) => (
        <StyledExternalLink key={index} {...link} />
      ))}
    </div>
  );
};

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
}: StyledExternalLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        `
        flex grow basis-1 items-center gap-2 rounded-lg border-2 px-4
        py-2 transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-base-8 focus:ring-offset-2
      `,
        className,
      )}
    >
      <span className={icon}></span>
      <span>{label}</span>
    </a>
  );
};
