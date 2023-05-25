<template>
  <div>
    <input v-model="videoId" />
    <h-btn @click="init">Generate Waveform</h-btn>
    <video-player v-if="confirmedVideoId" :video="{ id: confirmedVideoId }" />
  </div>
</template>
<script lang="ts" setup>
import { ProtoframeDescriptor, ProtoframePubsub } from "protoframe";
// import wasmDecoder from "opus-stream-decoder/dist/opus-stream-decoder";
// const { OpusStreamDecoder } = wasmDecoder();

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

const worker = new Worker(new URL("//ffprobe-worker.js", import.meta.url));

const videoId = ref("rtWfiSy_lL8");
const confirmedVideoId = ref("rtWfiSy_lL8");

function init() {
  confirmedVideoId.value = videoId.value;
  setTimeout(latch, 5000);
}

const client = ref<ProtoConnection>();

const progress = ref(0);
const totalSize = ref(1);

const format = ref<Format>();
const arr = ref<Uint8Array>();

function latch() {
  const iframe = document.getElementsByTagName("iframe")[0];
  const x = ProtoframePubsub.parent(
    ytAudioDLProtocol,
    iframe as HTMLIFrameElement
  );
  ProtoframePubsub.connect(x).then(() => {
    client.value = x;

    x.ask("fetchAudio", { videoId: confirmedVideoId.value }).then(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.error("fetchAudio failed", err);
      }
    );

    x.handleTell("fetchAudioComplete", (res) => {
      arr.value = res.audio;
      format.value = res.format;
      console.log("Done downloading...");

      processWaveform();
    });

    x.handleTell("progress", ({ percentage, total }) => {
      progress.value = percentage;
      totalSize.value = total;
      console.log(percentage, "% of", total);
    });
  });
}

async function processWaveform() {
  worker.onmessage = (event) => {
    const { data } = event;
    console.log("Completed transcoding", data);
    // const video = document.getElementById("output-video");
    // video.src = URL.createObjectURL(
    //   new Blob([data.buffer], { type: "video/mp4" })
    // );
  };
  worker.onerror = (error) => console.log(error);
  const obj = arr.value;
  if (!obj) {
    console.warn("Buffer is undefined?");
    return;
  }
  worker.postMessage(
    { name: "test", inType: "webm", outType: "n/a", buffer: obj.buffer },
    [obj.buffer]
  );
  console.log("Transcoding started");
}

// /* Receives decoded Float32Array PCM audio in left/right arrays.
//  * sampleRate is always 48000 and both channels would always contain data if
//  * samplesDecoded > 0.  Mono Opus files would decoded identically into both
//  * left/right channels and multichannel Opus files would be downmixed to 2 channels.
//  */
// function onDecode({ left, right, samplesDecoded, sampleRate }) {
//   console.log(`Decoded ${samplesDecoded} samples`);
//   // play back the left/right audio, write to a file, etc
// }
</script>
