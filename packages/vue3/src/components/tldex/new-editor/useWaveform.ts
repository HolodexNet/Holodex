import { ProtoframeDescriptor, ProtoframePubsub } from "protoframe";

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

export function useWaveformGenerator() {
  const worker = new Worker(
    new URL("./support/ffprobe-worker.js", import.meta.url),
  );

  const client = ref<ProtoConnection>();

  const stage = ref<
    "waiting" | "downloading" | "transcoding" | "done" | "error"
  >("waiting");
  const error_message = ref("");
  const progress = ref(0);
  const totalSize = ref(1);

  const format = ref<Format>();
  const arr = ref<Uint8Array>();
  const waveform = ref<[number, number][]>();

  function latchAndRun(videoId: string) {
    const iframe = document.getElementsByTagName("iframe")[0];
    const iframeCommunicationBus = ProtoframePubsub.parent(
      ytAudioDLProtocol,
      iframe as HTMLIFrameElement,
    );
    ProtoframePubsub.connect(iframeCommunicationBus).then(
      () => {
        client.value = iframeCommunicationBus;

        iframeCommunicationBus.ask("fetchAudio", { videoId }).then(
          (res) => {
            console.log(res);
            stage.value = "downloading";
          },
          (err) => {
            stage.value = "error";
            error_message.value =
              "Fetch Audio Failed, could not download appropriate audio from Youtube";
            console.error("fetchAudio failed", err);
          },
        );

        iframeCommunicationBus.handleTell("fetchAudioComplete", (res) => {
          arr.value = res.audio;
          format.value = res.format;
          console.log(res.format);
          console.log("Done downloading...");

          processWaveform();
        });

        iframeCommunicationBus.handleTell(
          "progress",
          ({ percentage, total }) => {
            stage.value = "downloading";
            progress.value = Math.round(percentage);
            totalSize.value = total;
            console.log(percentage, "% of", total);
          },
        );
      },
      () => {
        console.error("Failed to connect");
      },
    );
  }

  async function processWaveform() {
    worker.onmessage = (event) => {
      const { data } = event;
      const eventType: "result" | "error" | "progress" = data.type;

      if (eventType == "error") {
        stage.value = "error";
        error_message.value = String(data.error);
        return;
      } else if (eventType == "progress") {
        progress.value = data.ts as number;
        return;
      }
      console.log("Completed transcoding", data);
      if (!data.buffer) {
        stage.value = "error";
        error_message.value = "Undefined buffer, weird.";
        console.log("Returned Buffer is undefined?");
        return;
      }
      // clear buffer
      // arr.value = undefined;
      const out: [number, number][] = data.buffer;
      waveform.value = out;
      stage.value = "done";
      progress.value = 100;
    };
    worker.onerror = (error) => {
      console.log(error);
      stage.value = "error";
      error_message.value =
        "Unexpected error during WebWorker execution of Audio Transcoding";
    };
    const obj = arr.value;
    if (!obj) {
      console.warn("Buffer is undefined?");
      return;
    }
    worker.postMessage(
      { name: "test", inType: "webm", outType: "n/a", buffer: obj.buffer },
      [obj.buffer],
    );
    console.log("Transcoding started");
    stage.value = "transcoding";
    progress.value = 0;
  }

  return {
    latchAndRun,
    stage,
    error_message,
    progress,
    totalSize,
    format,
    waveform,
  };
}
