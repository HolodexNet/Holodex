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
import { currentVideoAtom } from "@/store/player";
import { useAtomValue, useSetAtom } from "jotai";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

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
          className="container"
          direction={siteIsSmall ? "vertical" : "horizontal"}
        >
          <ResizablePanel minSize={10} defaultSize={20}>
            <div className="px-4">
              <DefaultPlayerPositionAnchor className="aspect-video w-full overflow-hidden rounded-lg" />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="px-4">
            <h3 className="mb-4 mt-2 text-xl">Editing: {data?.title} </h3>

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
