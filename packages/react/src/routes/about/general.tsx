import { AboutDescription } from "@/components/about/Description";
import { AboutHeading } from "@/components/about/Heading";
import StatComponent from "@/components/about/Stats";
import { Loading } from "@/components/common/Loading";
import { darkAtom } from "@/hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { QuickLinks } from "@/components/about/QuickLinks";

export function AboutGeneral() {
  const { t } = useTranslation();

  const dark = useAtomValue(darkAtom);

  return (
    <article className="@container w-full">
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
