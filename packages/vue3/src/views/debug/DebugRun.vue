<template>
  <div
    class="flex items-center justify-center overflow-auto"
    style="height: calc(100vh - 80px)"
  >
    <div
      class="flex max-w-xs flex-col items-stretch gap-4 p-2 md:max-w-md lg:max-w-2xl"
    >
      <h-btn class="btn-info btn-lg" icon="i-fluent:clipboard-link-20-filled">
        Copy to Clipboard
      </h-btn>
      <div class="card bordered rounded-md shadow-xl">
        <div
          class="card-body overflow-scroll"
          style="max-height: calc(100vh - 200px); min-height: 100px"
        >
          <h-icon
            class="i-carbon:report absolute h-24 w-24 shrink-0 opacity-5"
          />
          <pre
            class="codeblock whitespace-pre-wrap"
          ><code class="font-mono">{{ JSON.stringify(fingerprint, null, 2) }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ClientJS } from "clientjs";

const client = new ClientJS();

const fingerprint = {
  ...(client as any).getBrowserData(),

  screen: {
    depth: client.getColorDepth(),
    resolution: client.getCurrentResolution(),
    // available_res: client.getAvailableResolution(),
    xdpi: client.getDeviceXDPI(),
    ydpi: client.getDeviceYDPI(),
  },

  feature: {
    localStorage: client.isLocalStorage(),
    sessionStorage: client.isSessionStorage(),
    cookie: client.isCookie(),
    canvas: client.isCanvas(),
  },

  locale: {
    timezone: client.getTimeZone(),
    lang: client.getLanguage(),
    syslang: client.getSystemLanguage(),
  },

  [`holodex-settings`]: {
    ...localStorage,
  },
};

if (fingerprint["holodex-settings"]["holodex-v2"])
  delete fingerprint?.["holodex-settings"]?.["holodex-v2"];
if (fingerprint["holodex-settings"]["hQCdb"])
  delete fingerprint["holodex-settings"]["hQCdb"];
</script>
<style>
.codeblock {
  overflow-wrap: break-word;
  overflow-wrap: anywhere;
}
</style>
