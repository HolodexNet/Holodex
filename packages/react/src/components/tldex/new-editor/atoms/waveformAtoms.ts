import { atom } from "jotai";
import { ProtoframeDescriptor, ProtoframePubsub } from "protoframe";

function waitForElm(selector: string) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function waitForIframeReady(iframe: HTMLIFrameElement) {
  return new Promise<void>((resolve) => {
    if (iframe.contentDocument?.readyState === "complete") {
      resolve();
    } else {
      iframe.addEventListener("load", () => resolve());
    }
    setTimeout(() => resolve(), 1000);
  });
}

export interface Format {
  itag: number;
  url?: string;
  width?: number;
  height?: number;
  last_modified: Date;
  content_length?: number;
  quality?: string;
  xtags?: string;
  drm_families?: string[];
  fps?: number;
  quality_label?: string;
  projection_type?:
    | "RECTANGULAR"
    | "EQUIRECTANGULAR"
    | "EQUIRECTANGULAR_THREED_TOP_BOTTOM"
    | "MESH";
  average_bitrate?: number;
  bitrate: number;
  spatial_audio_type?:
    | "AMBISONICS_5_1"
    | "AMBISONICS_QUAD"
    | "FOA_WITH_NON_DIEGETIC";
  target_duration_dec?: number;
  fair_play_key_uri?: string;
  stereo_layout?: "LEFT_RIGHT" | "TOP_BOTTOM";
  max_dvr_duration_sec?: number;
  high_replication?: boolean;
  audio_quality?: string;
  approx_duration_ms: number;
  audio_sample_rate?: number;
  audio_channels?: number;
  loudness_db?: number;
  signature_cipher?: string;
  is_drc?: boolean;
  drm_track_type?: string;
  distinct_params?: string;
  track_absolute_loudness_lkfs?: number;
  mime_type: string;
  is_type_otf: boolean;
  init_range?: {
    start: number;
    end: number;
  };
  index_range?: {
    start: number;
    end: number;
  };
  cipher?: string;
  audio_track?: {
    audio_is_default: boolean;
    display_name: string;
    id: string;
  };
  has_audio: boolean;
  has_video: boolean;
  has_text: boolean;
  language?: string | null;
  is_dubbed?: boolean;
  is_descriptive?: boolean;
  is_original?: boolean;
  color_info?: {
    primaries?: string;
    transfer_characteristics?: string;
    matrix_coefficients?: string;
  };
  caption_track?: {
    display_name: string;
    vss_id: string;
    language_code: string;
    kind?: "asr" | "frc";
    id: string;
  };
}
// Types
type WaveformGenerationStage =
  | "waiting"
  | "downloading"
  | "transcoding"
  | "done"
  | "error";

interface WaveformGeneratorState {
  stage: WaveformGenerationStage;
  errorMessage: string;
  progress: number;
  totalSize: number;
  format: Format | null;
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

// Atoms
export const waveformGeneratorStateAtom = atom<WaveformGeneratorState>({
  stage: "waiting",
  errorMessage: "",
  progress: 0, // 0-100 when stage=downloading, number of seconds when stage=transcoding
  totalSize: 1,
  format: null,
});

// Utility function to get min value from array of tuples
const getMin = (data: [number, number][]) => {
  return Math.min(...data.map(([_, value]) => value));
};

// Utility function to get max value from array of tuples
const getMax = (data: [number, number][]) => {
  return Math.max(...data.map(([_, value]) => value));
};

// <time, negative db loudness>
export const waveformAtom = atom<[number, number][]>([]);

// <time, normalized loudness>
export const normalizedLoudnessAtom = atom<[number, number][]>((get) => {
  const waveform = get(waveformAtom);

  // If no data, return empty array
  if (waveform.length === 0) return [];

  const EPSILON = 1e-10;

  // Convert each RMS dB value to amplitude
  // amplitude = 10^((dB + epsilon) / 20)
  const amplitudes = waveform.map(([time, db]) => {
    const amplitude = Math.pow(10, (db + EPSILON) / 20);
    return [time, amplitude] as [number, number];
  });

  // Get min and max for normalization
  const minAmplitude = getMin(amplitudes);
  const maxAmplitude = getMax(amplitudes);
  const range = maxAmplitude - minAmplitude + EPSILON; // Add epsilon to prevent division by zero

  // Normalize values to 0-1 range
  return amplitudes.map(([time, amplitude]) => {
    const normalized = (amplitude - minAmplitude) / range;
    return [time, normalized] as [number, number];
  });
});

// Action atom to trigger waveform generation

export const generateWaveformAtom = atom(
  null,
  async (_, set, videoId: string) => {
    console.log(`[generateWaveformAtom] Starting for videoId: ${videoId}`);

    const workerRef = new Worker(
      new URL("../hooks/support/ffprobe-worker.js", import.meta.url),
    );
    console.log("[generateWaveformAtom] Worker created");

    const setStage = (stage: WaveformGenerationStage) => {
      console.log(`[generateWaveformAtom] Setting stage to: ${stage}`);
      set(waveformGeneratorStateAtom, (prev) => ({ ...prev, stage }));
    };
    const setErrorMessage = (errorMessage: string) => {
      console.error(`[generateWaveformAtom] Error: ${errorMessage}`);
      set(waveformGeneratorStateAtom, (prev) => ({ ...prev, errorMessage }));
    };
    const setProgress = (progress: number) => {
      console.log(`[generateWaveformAtom] Progress: ${progress}%`);
      set(waveformGeneratorStateAtom, (prev) => ({ ...prev, progress }));
    };
    const setTotalSize = (totalSize: number) => {
      console.log(`[generateWaveformAtom] Total size: ${totalSize} bytes`);
      set(waveformGeneratorStateAtom, (prev) => ({ ...prev, totalSize }));
    };
    const setFormat = (format: Format | null) => {
      console.log(`[generateWaveformAtom] Setting format:`, format);
      set(waveformGeneratorStateAtom, (prev) => ({ ...prev, format }));
    };

    workerRef.onmessage = (event) => {
      const { data } = event;
      console.log(`[generateWaveformAtom] Worker message received:`, data);
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
            console.error(
              "[generateWaveformAtom] Returned Buffer is undefined",
            );
          } else {
            set(waveformAtom, data.buffer);
            setStage("done");
            setProgress(100);
            console.log("[generateWaveformAtom] Waveform generation completed");
          }
          break;
        default:
          console.log(
            `[generateWaveformAtom] Unhandled message type: ${data.type}`,
          );
          break;
      }
    };

    workerRef.onerror = (error) => {
      console.error("[generateWaveformAtom] Worker error:", error);
      setStage("error");
      setErrorMessage(
        "Unexpected error during WebWorker execution of Audio Transcoding",
      );
    };

    console.log("[generateWaveformAtom] Waiting for iframe element");
    await waitForElm("iframe");
    console.log("[generateWaveformAtom] iframe element found");

    const iframe = document.getElementsByTagName("iframe")[0];
    console.log("[generateWaveformAtom] Waiting for iframe to be ready");
    await waitForIframeReady(iframe);
    console.log("[generateWaveformAtom] iframe is ready");

    const iframeCommunicationBus = ProtoframePubsub.parent(
      ytAudioDLProtocol,
      iframe as HTMLIFrameElement,
    );

    console.log(
      "[generateWaveformAtom] Connecting to iframe communication bus",
    );
    ProtoframePubsub.connect(iframeCommunicationBus).then(
      () => {
        console.log(
          "[generateWaveformAtom] Connected to iframe communication bus",
        );
        iframeCommunicationBus.ask("fetchAudio", { videoId }).then(
          (res) => {
            console.log("[generateWaveformAtom] fetchAudio response:", res);
            setStage("downloading");
          },
          (err) => {
            console.error("[generateWaveformAtom] fetchAudio failed:", err);
            setStage("error");
            setErrorMessage(
              "Fetch Audio Failed, could not download appropriate audio from Youtube",
            );
          },
        );

        iframeCommunicationBus.handleTell("fetchAudioComplete", (res) => {
          console.log(
            "[generateWaveformAtom] fetchAudioComplete received:",
            res,
          );
          setFormat(res.format);
          console.log(
            "[generateWaveformAtom] Done downloading...",
            res.audio.byteLength,
            "bytes",
          );
          const arr = res.audio;
          if (!arr) {
            console.warn("[generateWaveformAtom] Buffer is undefined");
            return;
          }
          workerRef.postMessage(
            {
              name: "test",
              inType: "webm",
              outType: "n/a",
              buffer: arr.buffer,
            },
            [arr.buffer],
          );
          console.log("[generateWaveformAtom] Transcoding started");
          setStage("transcoding");
          setProgress(0);
        });

        iframeCommunicationBus.handleTell(
          "progress",
          ({ percentage, total }) => {
            console.log(
              `[generateWaveformAtom] Download progress: ${percentage}% of ${total} bytes`,
            );
            setStage("downloading");
            setProgress(Math.round(percentage));
            setTotalSize(total);
          },
        );
      },
      () => {
        console.error(
          "[generateWaveformAtom] Failed to connect to iframe communication bus",
        );
        setStage("error");
        setErrorMessage("Failed to connect to YouTube iframe");
      },
    );

    // Cleanup function
    return () => {
      console.log("[generateWaveformAtom] Cleanup: terminating worker");
      workerRef.terminate();
    };
  },
);
// Selector atoms for convenience
export const waveformStageAtom = atom(
  (get) => get(waveformGeneratorStateAtom).stage,
);
export const waveformErrorMessageAtom = atom(
  (get) => get(waveformGeneratorStateAtom).errorMessage,
);
export const waveformProgressAtom = atom(
  (get) => get(waveformGeneratorStateAtom).progress,
);
export const waveformTotalSizeAtom = atom(
  (get) => get(waveformGeneratorStateAtom).totalSize,
);
export const waveformFormatAtom = atom(
  (get) => get(waveformGeneratorStateAtom).format,
);
