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
                liveCount: (
                  <span className="mx-1 rounded-sm bg-secondary-5 p-1 text-sm" />
                ),
                upcomingCount: (
                  <span className="-mr-1 ml-1 rounded-sm bg-secondary-5 p-1 text-sm" />
                ),
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
