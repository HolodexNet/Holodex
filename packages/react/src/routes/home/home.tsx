import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { mostRecentOrgAtom } from "@/store/org";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { lazy, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ClipLanguageSelector } from "@/components/language/ClipLanguageSelector";

// New components for each tab
import { LiveTab } from "./LiveTab";
import { ArchiveTab } from "./ArchiveTab";
import { ClipsTab } from "./ClipsTab";
import { useVideoCardSizes } from "@/store/video";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/shadcn/ui/separator";
import {
  isSidebarOpenAtom,
  sidebarShouldBeFullscreenAtom,
} from "@/hooks/useFrame";
import { userAtom } from "@/store/auth";
import { useVideoSelection } from "@/hooks/useVideoSelection";

const ChannelsOrg = lazy(() =>
  import("../orgChannels").then((module) => ({ default: module.ChannelsOrg })),
);

export function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { org } = useParams();
  const setMostRecentOrg = useSetAtom(mostRecentOrgAtom);
  const [tab, setTab] = useState(searchParams.get("tab") ?? "live");

  if (!org) {
    // it's weird ther's no org.
    navigate("/org/Hololive", { replace: true });
  }

  useEffect(() => {
    if (!org) navigate("/org/Hololive", { replace: true });
    else setMostRecentOrg(org);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  useEffect(() => {
    console.log(`tab changed ${tab}`);
    searchParams.set("tab", tab);
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, tab]);

  if (!org) return <Navigate to="/org404" />;

  return (
    <>
      <Helmet>
        <title>{org} - Holodex</title>
      </Helmet>
      <Tabs defaultValue={tab} onValueChange={setTab}>
        <StickyTabsList tab={tab} fourthTab="Members" />
        <TabsContent value="live">
          <LiveTab />
        </TabsContent>
        <TabsContent value="archive">
          <ArchiveTab />
        </TabsContent>
        <TabsContent value="clips">
          <ClipsTab />
        </TabsContent>
        <TabsContent value="members">
          <ChannelsOrg />
        </TabsContent>
      </Tabs>
    </>
  );
}

function StickyTabsList({
  tab,
  fourthTab,
}: {
  tab: string;
  fourthTab: string;
}) {
  const { t } = useTranslation();
  // usehooks-ts way:
  // const { isIntersecting: isStuckAtTop, ref } = useIntersectionObserver({
  //   threshold: 1,
  //   rootMargin: "-1px 0px 0px 0px",
  // });
  // react-use way:

  const [open] = useAtom(isSidebarOpenAtom);
  const [isFullScreen] = useAtom(sidebarShouldBeFullscreenAtom);
  const user = useAtomValue(userAtom);

  return (
    <TabsList
      // ref={ref}
      // disable sticky when mobile panel is open and it should be fullscreen
      className={cn(
        "top-0 z-20 flex items-stretch justify-start overflow-x-auto rounded-none bg-base-2 p-2 transition-all md:px-10",
        //isStuckAtTop && "rounded-lg md:mx-8 md:px-2",
        !open ? "sticky" : isFullScreen ? "" : "sticky",
      )}
    >
      <TabsTrigger value="live" className="px-2">
        <Trans
          i18nKey="views.home.liveOrUpcomingHeading"
          components={{
            liveCount: <></>,
            upcomingCount: <></>,
          }}
        />
      </TabsTrigger>
      <TabsTrigger value="archive">
        {t("views.home.recentVideoToggles.official")}
      </TabsTrigger>
      <TabsTrigger value="clips">
        {t("views.home.recentVideoToggles.subber")}
      </TabsTrigger>
      <TabsTrigger value="members">{fourthTab}</TabsTrigger>
      <Separator orientation="vertical" className="relative h-10" />
      {/* The h-10 on this separator is actually load bearing - it maintains the height of the whole tab list */}
      {/* Optional Control Buttons */}
      {tab === "clips" && <ClipLanguageSelector />}
      {tab !== "members" && <CardSizeToggle />}
      {(user?.role === "admin" || user?.role === "editor") &&
        tab != "members" && <EditingStateToggle />}
    </TabsList>
  );
}

export default StickyTabsList;

export const CardSizeToggle: React.FC = () => {
  const { nextSize, setNextSize } = useVideoCardSizes(["list", "md", "lg"]);

  return (
    <Button
      className="shrink-0"
      size="icon-lg"
      variant="ghost"
      role="button"
      type="button"
      onClick={setNextSize}
    >
      <div
        className={cn(
          {
            md: "i-lucide:grid-3x3",
            lg: "i-lucide:layout-grid",
            list: "i-lucide:list",
            xs: "", // not used
            sm: "",
          }[nextSize],
        )}
      />
    </Button>
  );
};

export const EditingStateToggle: React.FC = () => {
  const { selectionMode, setSelectionMode, clearSelection } =
    useVideoSelection();

  return selectionMode ? (
    <Button
      className="shrink-0 px-2"
      size="lg"
      variant="primary"
      role="button"
      type="button"
      onClick={() => {
        setSelectionMode(!selectionMode);
        clearSelection();
      }}
    >
      <div className="i-lucide:check" /> Exit Edit Mode
    </Button>
  ) : (
    <Button
      className="shrink-0"
      size="icon-lg"
      variant="ghost"
      role="button"
      type="button"
      onClick={() => {
        setSelectionMode(!selectionMode);
        clearSelection();
      }}
    >
      <div className="i-lucide:edit" />
    </Button>
  );
};
