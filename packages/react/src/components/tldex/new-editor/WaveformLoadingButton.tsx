import React from "react";

import { formatBytes } from "@/lib/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  generateWaveformAtom,
  waveformAtom,
  waveformErrorMessageAtom,
  waveformFormatAtom,
  waveformGeneratorStateAtom,
  waveformProgressAtom,
  waveformStageAtom,
  waveformTotalSizeAtom,
} from "./atoms/waveformAtoms";

import { formatDuration } from "@/lib/time";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/shadcn/ui/menubar";

export const WaveformLoadingButton = ({ videoId }: { videoId: string }) => {
  const [, generateWaveform] = useAtom(generateWaveformAtom);
  const stage = useAtomValue(waveformStageAtom);
  const progress = useAtomValue(waveformProgressAtom);
  const totalSize = useAtomValue(waveformTotalSizeAtom);
  const errorMessage = useAtomValue(waveformErrorMessageAtom);
  const format = useAtomValue(waveformFormatAtom);
  const setWaveGeneratorState = useSetAtom(waveformGeneratorStateAtom);
  const [waveform, setWaveform] = useAtom(waveformAtom);

  const message = React.useMemo(() => {
    switch (stage) {
      case "waiting":
        return "Generate Waveform";
      case "downloading":
        return `Downloading: ${Math.round(progress)}% of ${formatBytes(totalSize)}`;
      case "transcoding":
        return `Transcoding: ${formatDuration(progress * 1000)}...`;
      case "done":
        return "✔";
      case "error":
        return `Error: ${errorMessage}`;
    }
  }, [stage, progress, totalSize, errorMessage]);

  const handleSaveWaveform = async () => {
    if (waveform.length > 0) {
      const waveformData = JSON.stringify({ videoId, waveform, format });
      const blob = new Blob([waveformData], { type: "application/json" });

      if ("showSaveFilePicker" in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `waveform_${videoId}.json`,
            types: [
              {
                description: "JSON Files",
                accept: { "application/json": [".json"] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          alert("Waveform saved successfully!");
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            console.error("Failed to save file:", err);
            alert("Failed to save waveform file.");
          }
        }
      } else {
        // Fallback for browsers that don't support the File System Access API
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `waveform_${videoId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleLoadWaveform = async () => {
    let fileContent;

    if ("showOpenFilePicker" in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: "JSON Files",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const file = await handle.getFile();
        fileContent = await file.text();
      } catch (err) {
        if ((err as unknown as Error).name !== "AbortError") {
          console.error("Failed to open file:", err);
          alert("Failed to load waveform file.");
        }
        return;
      }
    } else {
      // Fallback for browsers that don't support the File System Access API
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";

      const fileSelected = new Promise<File | null>((resolve) => {
        input.onchange = (e) =>
          resolve((e.target as HTMLInputElement).files?.[0] || null);
      });

      input.click();
      const file = await fileSelected;

      if (!file) return;
      fileContent = await file.text();
    }

    try {
      const {
        waveform: savedWaveform,
        format: savedFormat,
        videoId: savedVideoId,
      } = JSON.parse(fileContent);
      if (savedVideoId !== videoId) {
        alert("Warning: The loaded waveform is for a different video.");
      }
      setWaveform(savedWaveform);
      setWaveGeneratorState((st) => ({
        ...st,
        format: savedFormat,
        stage: "done",
      }));
      alert("Waveform loaded successfully!");
    } catch (err) {
      console.error("Failed to parse waveform data:", err);
      alert(
        "Failed to load waveform data. The file may be corrupted or in an incorrect format.",
      );
    }
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Audio Waveform</MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            onSelect={() => generateWaveform(videoId)}
            disabled={stage !== "waiting" && stage !== "error"}
          >
            {message}
            {format && stage === "done" && (
              <span className="ml-1">
                Format: {format.mime_type}, Bitrate: {format.bitrate}
              </span>
            )}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            onSelect={handleSaveWaveform}
            disabled={waveform.length === 0}
          >
            Save Waveform
          </MenubarItem>
          <MenubarItem onSelect={handleLoadWaveform}>
            Load Saved Waveform
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};
