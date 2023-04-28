<template>
  <h-card flat class="max-w-6xl">
    <div class="mb-4 flex items-center">
      <img
        src="/public/img/holodex-plus/holodex-plus-icon.png"
        class="mr-2 h-8 w-8"
      />
      <h2>{{ $t("views.extension.title") }}</h2>
    </div>
    <div class="p-0 md:p-6">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <img src="/public/img/holodex-plus/holodex-plus-screenshot.webp" />
        </div>
        <div>
          <h5 class="mb-2 text-lg">{{ $t("views.extension.features") }}</h5>
          <ul class="list-disc pl-5">
            <li>{{ $t("views.extension.featureset.one") }}</li>
            <li>{{ $t("views.extension.featureset.two") }}</li>
            <li>{{ $t("views.extension.featureset.three") }}</li>
            <li>{{ $t("views.extension.featureset.four") }}</li>
          </ul>

          <div class="mt-4 flex flex-wrap justify-center">
            <a
              href="https://chrome.google.com/webstore/detail/holodex-plus/mjcecbpccklceljomllkhilglcdcncbh"
              title="Chrome Webstore"
              class="mx-1"
            >
              <img
                src="/public/img/holodex-plus/chrome-webstore.png"
                class="h-12 w-auto rounded-lg"
              />
            </a>
            <a
              href="https://addons.mozilla.org/firefox/addon/holodex-plus/"
              title="Firefox Extension"
              class="mx-1"
            >
              <img
                src="/public/img/holodex-plus/firefox-amo.png"
                class="h-12 w-auto rounded-lg"
              />
            </a>
            <h-btn
              href="https://github.com/HolodexNet/Holodex-Plus"
              target="_blank"
              title="Github Download"
              class="mt-4"
              icon="i-carbon:logo-github"
            >
              <i class="" />
              Install from Github
            </h-btn>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-4 flex items-center">
      <img
        src="https://imgproxy.raycast.com/RNu0jpnAtWUnMiJAdLuIvB7-gpQ5ohNPGiR3td1FigI/rs:fill:64:64/dpr:2/aHR0cHM6Ly9maWxl/cy5yYXljYXN0LmNv/bS9vb2NlNzNybGFi/a2Z5M3QwZm5weWQ1/ZnVodzZz"
        class="mr-2 h-8 w-8"
      />
      <h2 class="text-lg font-semibold">Raycast Extension (macOS)</h2>
    </div>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div class="">
        <img
          src="https://files.raycast.com/ynzdcq6vupr1rptcwz2qd3j323f1"
          class="w-full"
        />
      </div>
      <div class="p-0 md:p-6">
        <div class="mb-2 text-xl">
          {{ $t("views.extension.features") }}
        </div>
        <ul class="list-disc pl-5">
          <li>Show ongoing live streams</li>
          <li>Search archives</li>
          <li>Search clips</li>
          <li>Search channels</li>
        </ul>

        <div class="mt-4 flex flex-wrap justify-center">
          <h-btn
            href="https://www.raycast.com/uetchy/holodex"
            target="_blank"
            title="Get it on Raycast Store"
            class="btn-lg"
          >
            <img
              src="https://raycastapp.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F9dab15c5-70d8-4f0d-a8b1-604b0b85912b%2Fraycast-logo-256.png?table=block&id=ce1ccf83-06b1-4ac8-b8d4-7b3276bf34e0&spaceId=50d13040-8e7c-4990-aed4-0844f62c7aa2&width=250&userId=&cache=v2"
              width="32"
              height="32"
              class="mr-2"
            />
            Get it on Raycast Store
          </h-btn>
          <h-btn
            href="https://github.com/HolodexNet/raycast-holodex"
            target="_blank"
            title="Github Download"
            class="mt-4"
            icon="i-carbon:logo-github"
          >
            <i class="" />
            Install from Github
          </h-btn>
        </div>
      </div>
    </div>

    <!-- The second card goes here -->
  </h-card>
</template>

<script lang="ts" setup></script>

<style>
/* This component is entirely converted by ChatGPT and lightly modified to look better. */
</style>
