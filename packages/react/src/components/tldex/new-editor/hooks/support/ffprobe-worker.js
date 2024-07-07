// eslint-disable-next-line no-undef
importScripts("ffmpeg.min.js");

let stdoutBuffer = [];

const messageProcessor = ({ type, message }) => {
  if (type === "ffout") {
    stdoutBuffer.push(message);
    const ts = message.split(",")[0];
    postMessage({ ts, type: "progress" }, []);
  }
};

const ffmpeg = self.FFmpeg.createFFmpeg({
  log: true,
  corePath: location.origin + "/ffprobe-core.js",
  wasmPath: location.origin + "/ffprobe-core.wasm",
  logger: messageProcessor,
  progressLogger: (message) => console.log(message),
  mainName: "main",
});

console.log("ffmpeg", ffmpeg);

onmessage = async (event) => {
  console.log("got message");
  try {
    const { buffer, name, inType, outType } = event.data;
    if (!ffmpeg.isLoaded()) {
      console.log("loading...");
      await ffmpeg.load();
      console.log("loaded");
    }

    ffmpeg.FS("writeFile", `${name}.${inType}`, new Uint8Array(buffer));
    await ffmpeg.run(
      "-f",
      "lavfi",
      "-show_entries",
      "frame=pkt_pts_time:frame_tags=lavfi.astats.Overall.RMS_level",
      "-of",
      "csv=p=0",
      "-i",
      `amovie=${name}.${inType},aresample=48000,asetnsamples=4800,astats=metadata=1:reset=1`,
    );
    // -f lavfi -i amovie=input.aac,astats=metadata=1:reset=1 -show_entries frame=pkt_pts_time:frame_tags=lavfi.astats.Overall.RMS_level,lavfi.astats.1.RMS_level,lavfi.astats.2.RMS_level -of

    // const data = await ffmpeg.FS("readFile", `out.json`);
    const jsonResponse = stdoutBuffer.map((x) => {
      const [a, b] = x.split(",");
      return [+a, +b || 0];
    });
    // console.log(jsonResponse);
    postMessage({ buffer: jsonResponse, type: "result" }, []);

    // delete files from memory
    ffmpeg.FS("unlink", `${name}.${inType}`);
    stdoutBuffer = [];
    // ffmpeg.FS("unlink", `out.json`);
  } catch (e) {
    postMessage({ type: "error", error: e });
  }
};
