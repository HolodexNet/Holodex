import { ProtoframeDescriptor, ProtoframePubsub } from "protoframe";
import { useEffect, useRef, useState } from "react";

interface Format {
  itag: number;
  url: string;
  mimeType: string;
  bitrate: number;
  width: number;
  height: number;
  lastModified: string;
  contentLength: string;
  quality: string;
  qualityLabel: string;
  projectionType: string;
  averageBitrate: number;
  audioQuality: string;
  approxDurationMs: string;
}

const ytAudioDLProtocol: ProtoframeDescriptor<{
  fetchAudio: {
    body: { videoId?: string };
    response: { state: "ok" | "failed"; msg: string; format?: Format };
  };
  progress: {
    body: { percentage: number; total: number };
  };
  fetchAudioComplete: {
    body: { audio: Uint8Array; format: Format };
  };
}> = { type: "audio_dl" };

type ProtoConnection = ProtoframePubsub<{
  fetchAudio: {
    body: { videoId?: string };
    response: { state: "ok" | "failed"; msg: string; format?: Format };
  };
  progress: {
    body: { percentage: number; total: number };
  };
  fetchAudioComplete: {
    body: { audio: Uint8Array; format: Format };
  };
}>;

type WaveformGenerationStage =
  | "waiting"
  | "downloading"
  | "transcoding"
  | "done"
  | "error";

function useWaveformGenerator() {
  const [ffmpegClient, setClient] = useState<ProtoConnection | null>(null);
  const [stage, setStage] = useState<WaveformGenerationStage>("waiting");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalSize, setTotalSize] = useState(1);
  const [format, setFormat] = useState<Format | null>(null);
  const [waveform, setWaveform] = useState<[number, number][]>([]);
  const workerRef = useRef<Worker | null>(null);

  // Initialize WebWorker once the component has mounted
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./support/ffprobe-worker.js", import.meta.url),
    );

    workerRef.current.onmessage = (event) => {
      const { data } = event;
      switch (data.type) {
        case "error":
          setStage("error");
          setErrorMessage(String(data.error));
          break;
        case "progress":
          setProgress(data.ts);
          break;
        case "result":
          if (!data.buffer) {
            setStage("error");
            setErrorMessage("Undefined buffer, weird.");
            console.log("Returned Buffer is undefined?");
          } else {
            setWaveform(data.buffer);
            setStage("done");
            setProgress(100);
          }
          break;
        default:
          break;
      }
    };

    workerRef.current.onerror = (error) => {
      console.log(error);
      setStage("error");
      setErrorMessage(
        "Unexpected error during WebWorker execution of Audio Transcoding",
      );
    };

    // Cleanup function
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  /**
   * Sets up communication with a youtube iframe and fetches audio data through Holodex Plus extension.
   *
   * @param {string} videoId - the ID of the video to fetch audio from
   * @return {void}
   */
  const latchAndRun = (videoId: string) => {
    const iframe = document.getElementsByTagName("iframe")[0];
    const iframeCommunicationBus = ProtoframePubsub.parent(
      ytAudioDLProtocol,
      iframe as HTMLIFrameElement,
    );

    ProtoframePubsub.connect(iframeCommunicationBus).then(
      () => {
        setClient(iframeCommunicationBus);

        iframeCommunicationBus.ask("fetchAudio", { videoId }).then(
          (res) => {
            console.log(res);
            setStage("downloading");
          },
          (err) => {
            setStage("error");
            setErrorMessage(
              "Fetch Audio Failed, could not download appropriate audio from Youtube",
            );
            console.error("fetchAudio failed", err);
          },
        );

        iframeCommunicationBus.handleTell("fetchAudioComplete", (res) => {
          setFormat(res.format);
          // format.value = res.format;
          console.log(res.format);
          console.log("Done downloading...", res.audio.byteLength, "bytes");

          const arr = res.audio;
          /** Convert the audio array into numbers using the webworker */
          if (!workerRef.current) return;
          const obj = arr;
          if (!obj) {
            console.warn("Buffer is undefined?");
            return;
          }
          workerRef.current.postMessage(
            {
              name: "test",
              inType: "webm",
              outType: "n/a",
              buffer: obj.buffer,
            },
            [obj.buffer],
          );
          console.log("Transcoding started");
          setStage("transcoding");
          setProgress(0);
        });

        iframeCommunicationBus.handleTell(
          "progress",
          ({ percentage, total }) => {
            setStage("downloading");
            setProgress(Math.round(percentage));
            setTotalSize(total);
            console.log(percentage, "% of", total);
          },
        );
      },
      () => {
        console.error("Failed to connect");
        setClient(null);
      },
    );
  };

  return {
    latchAndRun,
    stage,
    errorMessage,
    progress,
    totalSize,
    format,
    waveform,
  };
}
