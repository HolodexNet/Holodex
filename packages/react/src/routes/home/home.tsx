import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { mostRecentOrgAtom } from "@/store/org";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { lazy, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Helmet } from "@dr.pogodin/react-helmet";
import { ClipLanguageSelector } from "@/components/language/ClipLanguageSelector";
import { VideoListSettingsMenu } from "@/components/settings/VideoListSettingsMenu";

// New components for each tab
import { LiveTab } from "./LiveTab";
import { ArchiveTab } from "./ArchiveTab";
import { ClipsTab } from "./ClipsTab";
import { useVideoCardSizes } from "@/store/video";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";
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
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "live");

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
    console.log(`tab changed ${activeTab}`);
    searchParams.set("tab", activeTab);
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, activeTab]);

  if (!org) return <Navigate to="/org404" />;

  return (
    <>
      <Helmet>
        <title>{org} - Holodex</title>
      </Helmet>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <StickyTabsList activeTab={activeTab} org={org} />
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
  activeTab,
  org,
}: {
  activeTab: string;
  org?: string;
}) {
  const { t } = useTranslation();
  const membersTabLabel = t([
    `views.home.members.${org}`,
    "views.home.members.generic",
  ]);
  const [open] = useAtom(isSidebarOpenAtom);
  const [isFullScreen] = useAtom(sidebarShouldBeFullscreenAtom);
  const user = useAtomValue(userAtom);

  return (
    <TabsList
      className={cn(
        "w-full top-0 z-20 flex items-stretch overflow-hidden bg-background transition-all duration-200 mb-4",
        "border-b px-4 md:px-8 h-auto rounded-none",
        !open ? "sticky" : isFullScreen ? "" : "sticky",
      )}
    >
      <div className="flex w-full gap-4 md:items-center md:justify-between">
        <div className="flex space-x-1">
          <TabsTrigger value="live">
            {t("views.home.liveOrUpcomingHeading")}
          </TabsTrigger>

          <TabsTrigger value="archive">
            {t("views.home.recentVideoToggles.official")}
          </TabsTrigger>

          <TabsTrigger value="clips">
            {t("views.home.recentVideoToggles.subber")}
          </TabsTrigger>

          <TabsTrigger value="members">{membersTabLabel}</TabsTrigger>
        </div>

        <div className="flex items-center ml-auto space-x-2">
          {activeTab === "clips" && <ClipLanguageSelector />}

          {activeTab !== "members" && (
            <>
              <VideoListSettingsMenu activeTab={activeTab} />
              <CardSizeToggle />
            </>
          )}

          {(user?.role === "admin" || user?.role === "editor") &&
            activeTab !== "members" && <EditingStateToggle />}
        </div>
      </div>
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
