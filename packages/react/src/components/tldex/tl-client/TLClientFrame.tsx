import React, { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { useSetAtom } from "jotai";
import { headerHiddenAtom } from "@/hooks/useFrame";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import { idToVideoURL } from "@/lib/utils";

const TLControlBar = ({
  videoId,
  onVideoIdChange,
  onLoad,
}: {
  videoId: string;
  onVideoIdChange: (videoId: string) => void;
  onLoad: () => void;
}) => (
  <div className="flex gap-2 rounded-lg bg-base-3 p-2">
    <Input
      value={videoId}
      onChange={(e) => onVideoIdChange(e.target.value)}
      placeholder="Enter video ID..."
      className="w-64"
    />
    <Button onClick={onLoad}>Load</Button>
  </div>
);

export default function TLClientFrame() {
  const [videoId, setVideoId] = useState("");
  const makeHeaderHide = useSetAtom(headerHiddenAtom);
  const [speakers, setSpeakers] = useState([
    { id: 1, name: "Speaker 1" },
    { id: 2, name: "Speaker 2" },
    { id: 3, name: "Speaker 3" },
    { id: 4, name: "Speaker 4" },
    { id: 5, name: "Speaker 5" },
    { id: 6, name: "Speaker 5" },
    { id: 7, name: "Speaker 5" },
    { id: 8, name: "Speaker 5" },
    { id: 9, name: "Speaker 5" },
    { id: 10, name: "Speaker 5" },
  ]);
  const [currentSpeaker, setCurrentSpeaker] = useState(1);
  const [currentInput, setCurrentInput] = useState("");

  useEffect(() => {
    makeHeaderHide(true);
    return () => makeHeaderHide(false);
  }, [makeHeaderHide]);

  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-base-2 p-2">
      <TLControlBar
        videoId={videoId}
        onVideoIdChange={setVideoId}
        onLoad={() => {
          /* Implement load logic */
        }}
      />

      <div className="flex flex-1 flex-col gap-2">
        {/* Main viewing area with 23:9 aspect ratio constraint */}
        <div className="relative w-full" style={{ paddingTop: "39.13%" }}>
          <div className="absolute inset-0">
            <PanelGroup
              direction="horizontal"
              className="h-full rounded-lg bg-base-3"
            >
              <Panel minSize={13} defaultSize={15}>
                <div className="flex h-full flex-col border-r border-base-4">
                  <div className="border-b border-base-4 p-2 text-sm font-medium">
                    YouTube Chat
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {/* Chat content */}
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-2 bg-base-2 hover:bg-base-4" />
              <Panel minSize={30} defaultSize={70}>
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="aspect-video w-full">
                    <PlayerWrapper id={videoId} url={idToVideoURL(videoId)} />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-2 bg-base-2 hover:bg-base-4" />
              <Panel minSize={13} defaultSize={15}>
                <div className="flex h-full flex-col border-l border-base-4">
                  <div className="border-b border-base-4 p-2 text-sm font-medium">
                    TL Chat
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {/* TL chat content */}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </div>

        {/* Input and speaker selection area */}
        <div className="container flex flex-col gap-2 rounded-lg bg-base-3 p-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Enter translation..."
            className="h-12 text-lg"
          />

          <div className="grid grid-cols-10 gap-2">
            {speakers.map((speaker, i) => (
              <Button
                key={i}
                variant={
                  currentSpeaker === speaker.id ? "primary" : "base-outline"
                }
                className="h-10 justify-start gap-2"
                onClick={() => setCurrentSpeaker(speaker.id)}
              >
                <span className="text-xs text-base-11">{(i + 1) % 10}</span>
                <span className="truncate">{speaker.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
