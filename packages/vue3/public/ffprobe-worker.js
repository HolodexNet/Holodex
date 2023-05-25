importScripts("ffmpeg.min.js");

const stdoutBuffer = [];

const messageProcessor = ({ type, message }) => {
  if (type === "ffout") {
    stdoutBuffer.push(message);
  }
};

const ffmpeg = self.FFmpeg.createFFmpeg({
  log: true,
  corePath: "http://localhost:8080/ffprobe-core.js",
  wasmPath: "http://localhost:8080/ffprobe-core.wasm",
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
      "json",
      "-i",
      `amovie=${name}.${inType},astats=metadata=1:reset=1`
    );
    // -f lavfi -i amovie=input.aac,astats=metadata=1:reset=1 -show_entries frame=pkt_pts_time:frame_tags=lavfi.astats.Overall.RMS_level,lavfi.astats.1.RMS_level,lavfi.astats.2.RMS_level -of

    // const data = await ffmpeg.FS("readFile", `out.json`);
    const jsonResponse = stdoutBuffer.join("");
    console.log(jsonResponse);
    postMessage({ buffer: jsonResponse, type: "result" }, []);

    // delete files from memory
    ffmpeg.FS("unlink", `${name}.${inType}`);
    stdOutBuffer = [];
    // ffmpeg.FS("unlink", `out.json`);
  } catch (e) {
    postMessage({ type: "error", error: e });
  }
};
