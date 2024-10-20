import React, { useEffect, useState } from "react";
import { useFavoriteLive } from "@/services/live.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { useVideoCardSizes } from "@/store/video";
import PullToRefresh from "@/components/layout/PullToRefresh";
import { useVideoFilter } from "@/hooks/useVideoFilter";
import StickyTabsList from "../home/home";
import { FavoritedChannels } from "./favoritedChannels";
import { Tabs, TabsContent } from "@/shadcn/ui/tabs";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Separator } from "@/shadcn/ui/separator";
import { FavoritesArchiveTab, FavoritesClipTab } from "./favoriteOtherTabs";

export function FavoritesLive() {
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);

  const { data: live, isLoading: liveLoading, refetch } = useFavoriteLive();

  const liveFiltered = useVideoFilter(
    live as Video[],
    "stream_schedule",
    "favorites",
  );

  return (
    <>
      <PullToRefresh onRefresh={refetch}>
        <MainVideoListing
          isLoading={liveLoading}
          size={cardSize}
          videos={liveFiltered?.filter(({ status }) => status === "live") ?? []}
        />
        <Separator className="mb-4 mt-2 w-full border-base-3 lg:mb-6 lg:mt-4" />
        <MainVideoListing
          isLoading={liveLoading}
          size={cardSize}
          videos={liveFiltered?.filter(({ status }) => status !== "live") ?? []}
        />
      </PullToRefresh>
    </>
  );
}

export function FavoritesHome() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  // const { org } = useParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "live");

  // useEffect(() => {
  //   navigate(`/org/${currentOrg}`, { replace: true });
  // }, [currentOrg, navigate]);

  useEffect(() => {
    console.log(`tab changed ${tab}`);
    searchParams.set("tab", tab);
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, tab]);

  // TODO: probably use a different flag than "Oshis", but idk between Members or What
  return (
    <>
      <Helmet>
        <title>Favorites - Holodex</title>
      </Helmet>
      <Tabs defaultValue={tab} onValueChange={setTab}>
        <StickyTabsList tab={tab} fourthTab="Oshis" />
        <TabsContent value="live">
          <FavoritesLive />
        </TabsContent>
        <TabsContent value="archive">
          <FavoritesArchiveTab />
        </TabsContent>
        <TabsContent value="clips">
          <FavoritesClipTab />
        </TabsContent>
        <TabsContent value="members">
          <FavoritedChannels />
        </TabsContent>
      </Tabs>
    </>
  );
}
