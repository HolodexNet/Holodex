import { Loading } from "@/components/common/Loading";
import { VideoEditSongs } from "@/components/edit/VideoEditSongs";
import { VideoEditTopic } from "@/components/edit/VideoEditTopic";
import { DefaultPlayerPositionAnchor } from "@/components/player/DefaultPlayerPositionAnchor";
import { useVideo } from "@/services/video.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { currentVideoAtom } from "@/store/player";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function EditVideo() {
  const { id } = useParams();
  const { t } = useTranslation();
  const setCurrentVideo = useSetAtom(currentVideoAtom);
  const { data, error, isPending, isSuccess } = useVideo({ id: id! });

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
      <div className="flex h-full w-full flex-col gap-8 p-4 md:p-8 lg:flex-row">
        <div className="flex w-full max-w-md shrink-0 grow-0 basis-auto flex-col lg:basis-1/3">
          <DefaultPlayerPositionAnchor className="aspect-video w-full overflow-hidden rounded-lg" />
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
              <VideoEditSongs />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
