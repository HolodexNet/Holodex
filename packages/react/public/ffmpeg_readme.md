# FFMPEG changes:


### Basic components
ffmpeg is built out of two components: `@ffmpeg/ffmpeg` and `@ffmpeg/core`
the core contains the instructions to build the web assembly binaries + a js accompanying the wasm that... executes it?
and the ffmpeg package builds the 'environment' that handles the WASM. So, splitting logic up:

#### ffmpeg-core:
- builds a webassembly file and a js file
- js file knows how to create a FFMPEG WASM instance
- js file provides callbacks and stuff to tap this instance.

In this case, we modified the core to build `ffprobe-core.wasm` instead of `ffmpeg-core.wasm` and `ffprobe-core.js` instead of `ffmpeg-core.js` instead. Incidentally the entrypoint is now `createFFprobeCore`. We used a light modified build script to target ffprobe.c instead of ffmpeg.c for the executable.


#### ffmpeg/ffmpeg:
- builds a service worker js
- has API to run(), exit(), FS read/write, and other stuff to tap the binary's STDOUT/STDERR.

We modified the ffmpeg.min.js (**the changes are in the ffmpeg_src.zip**) by compiling it using the build-serviceworker NPM script, and lightly modifying its behaviors.
- fixed a bug in createFFmpeg where the customLogger is not hooked up to the logger
- changed it to look for `createFFprobeCore` instead.
- modified the defaultArgs of the executable args to be ffprobe friendly.


### How to improve anything
- if you want to modify `ffmpeg.min.js(+.map)`, you need to go to node_modules/@ffmpeg/ffmpeg and replace the src folder with the ffmpeg_src.zip, then recompile using npm i and npm run build.
- if you want to modify ffprobe-core.js/ffprobe-core.wasm, you need to rebuild ffmpeg-core via github actions.
- if you want to modify the worker, the worker code is just there.


