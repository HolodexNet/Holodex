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
import { EmptyQuip } from "../home/EmptyQuip";

export function FavoritesLive() {
  const { t } = useTranslation();
  const [randN] = useState(Math.floor(Math.random() * 100));
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);

  const {
    data: liveOrUpcoming,
    isLoading: liveLoading,
    refetch,
  } = useFavoriteLive();

  const filtered = useVideoFilter(
    liveOrUpcoming as Video[],
    "stream_schedule",
    "favorites",
  );

  const nowLive = filtered?.filter(({ status }) => status === "live") ?? [];
  const upcoming = filtered?.filter(({ status }) => status !== "live") ?? [];

  return (
    <>
      <PullToRefresh onRefresh={refetch}>
        <MainVideoListing
          isLoading={liveLoading}
          size={cardSize}
          videos={nowLive}
        />
        {!liveLoading && nowLive.length == 0 && <EmptyQuip />}
        <Separator className="mb-4 mt-2 w-full border-base-3 lg:mb-6 lg:mt-4" />
        <MainVideoListing
          isLoading={liveLoading}
          size={cardSize}
          videos={upcoming}
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
        <title>{t("component.mainNav.favorites")} - Holodex</title>
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
