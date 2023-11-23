import { Loading } from "@/components/common/Loading";
import { VideoEditTopic } from "@/components/edit/VideoEditTopic";
import { VideoPortalContext } from "@/components/layout/Frame";
import { useVideo } from "@/services/video.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { currentVideoAtom } from "@/store/player";
import { useSetAtom } from "jotai";
import { useContext, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { OutPortal } from "react-reverse-portal";
import { useParams } from "react-router-dom";

export default function EditVideo() {
  const { id } = useParams();
  const { t } = useTranslation();
  const portalNode = useContext(VideoPortalContext);
  const setCurrentVideo = useSetAtom(currentVideoAtom);
  const { data, error, isPending, isSuccess } = useVideo({ id: id! });

  useEffect(() => {
    if (data)
      setCurrentVideo({
        ...data,
        url: `https://youtu.be/${id}`,
      });
  }, [isSuccess]);

  return (
    <>
      <Helmet></Helmet>
      <div className="flex h-full w-full gap-8 p-4 md:p-8">
        <div className="flex w-full shrink-0 grow-0 basis-1/3 flex-col">
          <OutPortal
            style={{ aspectRatio: "16 / 9" }}
            className="overflow-hidden rounded-lg"
            node={portalNode}
          />
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
          </Tabs>
        )}
      </div>
    </>
  );
}
