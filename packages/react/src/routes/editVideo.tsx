import { Loading } from "@/components/common/Loading";
import { VideoEditSongs } from "@/components/edit/VideoEditSongs";
import { VideoEditTopic } from "@/components/edit/VideoEditTopic";
import { siteIsSmallAtom } from "@/hooks/useFrame";
import { useVideo } from "@/services/video.service";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { TypographyH3, TypographyH4 } from "@/shadcn/ui/typography";
import { miniplayerVideoAtom } from "@/store/player";
import { useAtomValue, useSetAtom } from "jotai";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import "./editVideo.scss";
import { VideoEditMusic } from "@/components/edit/VideoEditMusic";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";

export default function EditVideo() {
  const { id } = useParams();
  const { t } = useTranslation();
  const setCurrentVideo = useSetAtom(miniplayerVideoAtom);
  const siteIsSmall = useAtomValue(siteIsSmallAtom);
  const { data, error, isPending, isSuccess } = useVideo<PlaceholderVideo>({
    id: id!,
  });
  const [tab, setTab] = useState("topic");

  return (
    <>
      <Helmet></Helmet>
      <div className="flex h-full w-full flex-col gap-8 p-4 md:p-8 lg:flex-row">
        <div className="flex w-full max-w-md shrink-0 grow-0 basis-auto flex-col lg:basis-1/3">
          {isSuccess && <PlayerWrapper id={data.id} url={data.link} />}
        </div>
        {isPending || error ? (
          <Loading size="lg" error={error} />
        ) : (
          <Tabs className="w-full grow-0 basis-2/3" defaultValue="topic">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="topic">
                {t("component.search.type.topic")} /{" "}
                {t("views.editor.channelMentions.title")}
              </TabsTrigger>
              <TabsTrigger value="music">
                {t("component.mainNav.music")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="topic">
              <VideoEditTopic video={data} />
            </TabsContent>
            <TabsContent value="music">
              {isSuccess && <VideoEditSongs />}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
