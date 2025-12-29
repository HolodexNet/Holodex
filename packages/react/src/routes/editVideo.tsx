import { Loading } from "@/components/common/Loading";
import { VideoEditTopicV2 } from "@/components/edit/VideoEditTopicV2";
import { useVideo } from "@/services/video.service";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shadcn/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { TypographyH3 } from "@/shadcn/ui/typography";
import { useState } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import "./editVideo.scss";
import { VideoEditMusic } from "@/components/edit/VideoEditMusic";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";

export function EditVideo() {
  const { videoId } = useParams();
  const { t } = useTranslation();
  const { data, error, isPending, isSuccess } = useVideo<PlaceholderVideo>({
    id: videoId!,
  });
  const [tab, setTab] = useState("topic");
  const [isHorizontal, setIsHorizontal] = useState(true); // Add this state

  return (
    <>
      <Helmet></Helmet>
      <div className="">
        <ResizablePanelGroup
          className="px-4 container mx-auto min-h-[90vh]"
          orientation={isHorizontal ? "vertical" : "horizontal"}
          // it's talking about content direction, not the direction of the splitter.
        >
          <ResizablePanel>
            {isSuccess && data && (
              <PlayerWrapper
                id={data?.id}
                url={idToVideoURL(data.id, data.link)}
                autoplay={false}
              ></PlayerWrapper>
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="px-4">
            <div className="flex items-center gap-4 mt-2 mb-4">
              <Button
                variant="base-outline"
                size="icon-lg"
                onClick={() => setIsHorizontal(!isHorizontal)}
              >
                <div
                  className={
                    isHorizontal
                      ? "i-mingcute:rotate-to-vertical-line -rotate-180 -scale-x-100"
                      : "i-mingcute:rotate-to-vertical-line rotate-90 "
                  }
                />
              </Button>
              <TypographyH3>Editing: {data?.title}</TypographyH3>
            </div>
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
                    {t("views.editor.changeMusic.title")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="topic">
                  <VideoEditTopicV2 video={data} />
                </TabsContent>
                <TabsContent value="music">
                  <VideoEditMusic video={data} />
                </TabsContent>
              </Tabs>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
