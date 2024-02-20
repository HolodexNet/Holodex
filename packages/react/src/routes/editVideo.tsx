import { Loading } from "@/components/common/Loading";
import { VideoEditTopic } from "@/components/edit/VideoEditTopic";
import { DefaultPlayerPositionAnchor } from "@/components/player/DefaultPlayerPositionAnchor";
import { siteIsSmallAtom } from "@/hooks/useFrame";
import { useVideo } from "@/services/video.service";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { TypographyH3, TypographyH4 } from "@/shadcn/ui/typography";
import { currentVideoAtom } from "@/store/player";
import { useAtomValue, useSetAtom } from "jotai";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import "./editVideo.scss";

export default function EditVideo() {
  const { id } = useParams();
  const { t } = useTranslation();
  const setCurrentVideo = useSetAtom(currentVideoAtom);
  const siteIsSmall = useAtomValue(siteIsSmallAtom);
  const { data, error, isPending, isSuccess } = useVideo({ id: id! });
  const [tab, setTab] = useState("topic");

  useEffect(() => {
    if (data)
      setCurrentVideo({
        ...data,
        url: `https://youtu.be/${id}`,
      });
  }, [data, id, setCurrentVideo]);

  return (
    <>
      <Helmet></Helmet>
      <div className="">
        <div className="container"></div>
        <ResizablePanelGroup
          className="container min-h-[90vh]"
          direction={siteIsSmall ? "vertical" : "horizontal"}
        >
          <ResizablePanel minSize={10} defaultSize={20}>
            <div id="player-anchor-container" className="relative h-full p-2">
              <DefaultPlayerPositionAnchor
                id="player-anchor"
                className="overflow-hidden"
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="px-4">
            <TypographyH3 className="mb-4 mt-2">
              Editing: {data?.title}
            </TypographyH3>

            {isPending || error ? (
              <Loading size="lg" error={error} />
            ) : (
              <Tabs
                className="w-full grow-0 basis-2/3"
                defaultValue="topic"
                onValueChange={setTab}
                value={tab}
              >
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="topic">
                    {t("views.editor.changeTopic.title")} /{" "}
                    {t("views.editor.channelMentions.title")}
                  </TabsTrigger>
                  <TabsTrigger value="music">
                    {t("component.mainNav.music")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="topic">
                  <VideoEditTopic video={data} />
                </TabsContent>
                <TabsContent value="music">Music stuff</TabsContent>
              </Tabs>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
