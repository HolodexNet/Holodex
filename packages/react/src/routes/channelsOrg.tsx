import { ChannelCard } from "@/components/channel/ChannelCard";
import { useChannels } from "@/services/channel.service";
import { orgAtom } from "@/store/org";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

export default function ChannelsOrg() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { org } = useParams();
  const currentOrg = useAtomValue(orgAtom);

  const { data: channels, fetchNextPage: fetchChannels } = useChannels({
    org,
    sort: "suborg",
  });

  useEffect(() => {
    navigate(`/org/${currentOrg}/channels`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg]);

  return (
    <>
      <Helmet>
        <title>
          {currentOrg} {t("component.mainNav.channels")} - Holodex
        </title>
      </Helmet>
      <div className="h-full w-full p-4 md:p-8">
        <VirtuosoGrid
          useWindowScroll
          listClassName="w-full grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-x-4 gap-y-6"
          data={channels?.pages.flat() ?? []}
          itemContent={(_, channel) => <ChannelCard {...channel} />}
          endReached={async () => {
            await fetchChannels();
          }}
        />
      </div>
    </>
  );
}
