import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { orgAtom } from "@/store/org";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
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

export function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { org } = useParams();
  const currentOrg = useAtomValue(orgAtom);
  const [tab, setTab] = useState(searchParams.get("tab") ?? "live");

  useEffect(() => {
    navigate(`/org/${currentOrg}`, { replace: true });
  }, [currentOrg, navigate]);

  useEffect(() => {
    console.log(`tab changed ${tab}`);
    searchParams.set("tab", tab);
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, tab]);

  if (!org) return <Navigate to="/org404" />;

  return (
    <>
      <Helmet>
        <title>{currentOrg} - Holodex</title>
      </Helmet>
      <Tabs defaultValue={tab} onValueChange={setTab}>
        <TabsList className="sticky top-0 z-20 flex h-fit max-w-full justify-start overflow-x-auto bg-base-1 md:px-8">
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
          <div className="flex grow" />
          {tab === "clips" && <ClipLanguageSelector />}
          <CardSizeToggle />
        </TabsList>
        <TabsContent value="live">
          <LiveTab />
        </TabsContent>
        <TabsContent value="archive">
          <ArchiveTab />
        </TabsContent>
        <TabsContent value="clips">
          <ClipsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}

export const CardSizeToggle: React.FC = () => {
  const { nextSize, setNextSize } = useVideoCardSizes(["list", "md", "lg"]);

  const handleClick = () => {
    setNextSize();
    console.log("new card size", nextSize);
  };

  return (
    <Button
      className="shrink-0"
      size="icon-lg"
      variant="ghost"
      role="button"
      type="button"
      onClick={handleClick}
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
