import React, { useState, useEffect, useCallback } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PlayerWrapper } from "@/components/layout/PlayerWrapper";
import { useAtom, useSetAtom } from "jotai";
import { headerHiddenAtom } from "@/hooks/useFrame";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { idToVideoURL } from "@/lib/utils";
import { Speaker } from "./Speaker";
import { tldexSpeakerConfig } from "@/store/tldex";
import { Label } from "@/shadcn/ui/label";

const SpeakerButton = ({
  speaker,
  isActive,
  shortcut,
  onClick,
  onEdit,
}: {
  speaker: Speaker;
  isActive: boolean;
  shortcut: string;
  onClick: () => void;
  onEdit: (speaker: Speaker) => void;
}) => (
  <Button
    variant={isActive ? "primary" : "base-outline"}
    className="gap-2 h-10 justify-start pr-1"
    onClick={onClick}
  >
    <span className="text-xs text-base-11">{shortcut}</span>
    <span className="truncate">
      {speaker.prefix}
      {speaker.name}
      {speaker.suffix}
    </span>
    {isActive && (
      <div
        className="ml-auto w-6 rounded-sm p-1 hover:bg-primary-9"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(speaker);
        }}
      >
        <div className="h-4 w-4 i-heroicons-pencil" />
      </div>
    )}
  </Button>
);

const SpeakerEditDialog = ({
  speaker,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: {
  speaker: Speaker;
  isOpen: boolean;
  onClose: () => void;
  onSave: (speaker: Speaker) => void;
  onDelete: (id: number) => void;
}) => {
  const [name, setName] = useState(speaker?.name || "");
  const [prefix, setPrefix] = useState(speaker?.prefix || "");
  const [suffix, setSuffix] = useState(speaker?.suffix || "");

  useEffect(() => {
    if (isOpen) {
      setName(speaker?.name || "");
      setPrefix(speaker?.prefix || "");
      setSuffix(speaker?.suffix || "");
    }
  }, [isOpen, speaker]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onKeyDown={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Speaker</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Button Label</Label>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Prefix</Label>
            <Input
              placeholder="Prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </div>
          <div>
            <Label>Suffix</Label>
            <Input
              placeholder="Suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
            />
          </div>
          <div>
            <p>Example:</p>
            <p className="pl-2 font-semibold border-l-2 border-l-base-4">
              {prefix} Typed Translation {suffix}
            </p>
          </div>
          <div className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => onDelete(speaker.id)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button
              onClick={() => onSave({ ...speaker, name, prefix, suffix })}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const KeyboardHelp = () => (
  <div
    className={`max-h-96 rounded-lg bg-base-3 p-4 transition-all duration-300`}
  >
    <h3 className="mb-2 font-medium">Keyboard Shortcuts</h3>
    <ul
      className="grid gap-1 text-sm grid-cols-2"
      style={{ gridTemplateColumns: "auto 1fr" }}
    >
      <kbd className="ml-auto block text-sm pointer-events-none text-base-8 tracking-widest">
        {/* <span className="rounded-sm bg-base-4 p-0.5">⇪</span> */}
        {/* <span className="rounded-sm p-0.5">Ctrl-1~9</span> */}
        <div className="inline-block i-vaadin:ctrl-a"></div>
        <div className="inline-block i-f7:number-square"></div>
      </kbd>
      <span>Select speaker</span>
      <kbd className="pointer-events-none ml-auto text-sm tracking-widest text-base-8">
        <div className="inline-block i-uil:enter"></div>
      </kbd>
      <span>Send message</span>
      <kbd className="pointer-events-none ml-auto text-sm tracking-widest text-base-8">
        <div className="inline-block i-ic:sharp-keyboard-tab"></div>
      </kbd>
      <span>Next speaker</span>
      <kbd className="pointer-events-none ml-auto text-sm tracking-widest text-base-8">
        <div className="inline-block i-bi:shift"></div>
        <div className="i-ic:sharp-keyboard-tab inline-block"></div>
      </kbd>
      <span>Prev speaker</span>
    </ul>
  </div>
);

export default function TLClientFrame() {
  const [videoId, setVideoId] = useState("");
  const makeHeaderHide = useSetAtom(headerHiddenAtom);
  const [speakers, setSpeakers] = useAtom<Speaker[]>(tldexSpeakerConfig);
  const [currentSpeaker, setCurrentSpeaker] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

  useEffect(() => {
    makeHeaderHide(true);
    return () => makeHeaderHide(false);
  }, [makeHeaderHide]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < speakers.length) {
          if (index === -1) {
            setCurrentSpeaker(9);
          }
          setCurrentSpeaker(index);
        }
      }
      // Tab and shift-tab:
      else if (e.key === "Tab") {
        e.preventDefault();
        // shift:
        if (e.shiftKey) {
          setCurrentSpeaker(
            (currentSpeaker - 1 + speakers.length) % speakers.length,
          );
        }
        // no shift:
        else {
          setCurrentSpeaker((currentSpeaker + 1) % speakers.length);
        }
      }
    },
    [currentSpeaker, speakers],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, speakers]);

  useEffect(() => {
    if (!speakers || speakers.length === 0) {
      setSpeakers([{ id: 1, name: "Default", prefix: "", suffix: "" }]);
    }
  }, [setSpeakers, speakers]);

  const addSpeaker = () => {
    const newId = Math.max(...speakers.map((s) => s.id), 0) + 1;
    const newSpeaker = {
      id: newId,
      name: `Speaker ${newId}`,
      prefix: "",
      suffix: "",
    };
    setSpeakers([...speakers, newSpeaker]);
    setEditingSpeaker(newSpeaker);
  };

  const saveSpeaker = (updatedSpeaker: Speaker) => {
    setSpeakers(
      speakers.map((s) => (s.id === updatedSpeaker.id ? updatedSpeaker : s)),
    );
    setEditingSpeaker(null);
  };

  const deleteSpeaker = (id: number) => {
    setSpeakers(speakers.filter((s) => s.id !== id));
    setEditingSpeaker(null);
    if (currentSpeaker === id) {
      setCurrentSpeaker(speakers[0]?.id);
    }
  };

  return (
    <div className="flex flex-col gap-2 h-screen p-6">
      <div className="flex items-center gap-2">
        <Input
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
          placeholder="Enter video ID..."
          className="w-64"
        />
        <Button
          onClick={() => {
            /* Implement load logic */
          }}
        >
          Load
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="relative w-full" style={{ paddingTop: "39.13%" }}>
          <div className="absolute inset-0">
            <PanelGroup
              direction="horizontal"
              className="h-full rounded-lg bg-base-3"
            >
              <Panel minSize={30} defaultSize={70}>
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="aspect-video w-full">
                    <PlayerWrapper id={videoId} url={idToVideoURL(videoId)} />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="w-2 bg-base-2 hover:bg-base-4" />
              <Panel minSize={13} defaultSize={15}>
                <div className="flex h-full flex-col border-base-4 border-l">
                  <div className="border-base-4 text-sm font-medium border-b p-2">
                    TL Chat
                  </div>
                  <div className="flex-1 overflow-y-auto p-2" />
                </div>
              </Panel>
              <PanelResizeHandle className="w-2 bg-base-2 hover:bg-base-4" />
              <Panel minSize={13} defaultSize={15}>
                <div className="flex h-full flex-col border-r border-base-4">
                  <div className="border-b border-base-4 p-2 text-sm font-medium">
                    YouTube Chat
                  </div>
                  <div className="flex-1 overflow-y-auto p-2" />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-1 flex-col gap-2 rounded-lg bg-base-3 p-2">
            <div className="flex items-center gap-1 flex-row">
              {speakers[currentSpeaker].prefix && (
                <span className="rounded-sm border p-1 border-base-6">
                  {speakers[currentSpeaker].prefix}
                </span>
              )}
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Enter translation..."
                className="text-lg h-12"
              />
            </div>
            <div className="grid gap-2 grid-cols-10">
              {speakers.map((speaker, i) => (
                <SpeakerButton
                  key={speaker.id}
                  speaker={speaker}
                  isActive={i === currentSpeaker}
                  shortcut={i <= 9 ? `${(i + 1) % 10}` : "-"}
                  onClick={() => setCurrentSpeaker(speaker.id)}
                  onEdit={setEditingSpeaker}
                />
              ))}
              {speakers.length < 10 && (
                <Button
                  variant="base-outline"
                  className="h-10"
                  onClick={addSpeaker}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <KeyboardHelp />
        </div>
      </div>

      {editingSpeaker && (
        <SpeakerEditDialog
          speaker={editingSpeaker}
          isOpen={!!editingSpeaker}
          onClose={() => setEditingSpeaker(null)}
          onSave={saveSpeaker}
          onDelete={deleteSpeaker}
        />
      )}
    </div>
  );
}
