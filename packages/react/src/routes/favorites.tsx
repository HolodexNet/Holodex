import { useFavorites } from "@/services/user.service";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { VirtuosoGrid } from "react-virtuoso";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

export function Favorites() {
  const { t } = useTranslation();
  const { data: favChannels } = useFavorites();
  return (
    <>
      <Helmet>
        <title>{t("component.mainNav.favorites")} - Holodex</title>
      </Helmet>
      <div className="h-full w-full p-4 md:p-8">
        <VirtuosoGrid
          useWindowScroll
          listClassName="w-full grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-x-4 gap-y-6"
          data={favChannels?.flat() ?? []}
          itemContent={(_, channel) => <ChannelCard size="lg" {...channel} />}
        />
      </div>
    </>
  );
}
