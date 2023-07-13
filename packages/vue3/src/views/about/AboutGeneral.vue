<template>
  <article class="prose max-w-3xl">
    <h3 class="mb-2 text-lg lg:block hidden">What we are?</h3>
    <p>
      <b>Holodex</b>
      is a fan-built platform for watching VTubers. We are built by DD for DDs.
    </p>
    <h-row class="items-center">
      <holodex-stats class="my-2 grow justify-center" />
    </h-row>
    <p>
      We organize clips and collabs by talents included, tabulate songs sang
      inside individual videos and as part of karaoke streams, compile agencies
      and groups by generation and branch, provide ways to favorite clips and
      streams, and allow you to watch livestreams with TLs (or produce TLs live
      or in VODs with community-caption-alike features).
    </p>
    <p>
      We comply with the Derivative Work Agreement of hololive production and
      attempt to extend that to other orgs and agencies. We also operate within
      the specifications of Youtube Data API and Embed Player Terms of Service.
      Please reach out to us via Discord or Twitter DM for any service
      inquiries.
    </p>
    <h3 class="mb-2 mt-6 text-lg">Credits</h3>
    <p>
      Big shout out to Jet/HoloTools for helping us with the API and inspiring
      the Multiview.
    </p>
    <p>
      We'd like to thank our long list of contributors and over 100 editors:
    </p>
    <ul class="list-item list-inside indent-4">
      <li class="list-disc">RiceCakes (creator, admin)</li>
      <li class="list-disc">Xrave (admin)</li>
      <li class="list-disc">Uetchy (dev, designer)</li>
      <li class="list-disc">MadeT (designer)</li>
      <li class="list-disc">NeloBlivion (twitch support, editor)</li>
      <li class="list-disc opacity-60">
        <small>
          (If you'd like to add your name to this list, drop us a poke on
          Discord!)
        </small>
      </li>
    </ul>
    <p class="text-sm opacity-60" />
    <h3 class="mb-2 mt-4 text-lg">Quick Links</h3>
    <div
      id="qlinks"
      class="grid grid-flow-dense gap-2"
      style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))"
    >
      <a
        class="btn-outline btn-info btn p-0"
        title="Follow us on twitter"
        href="https://twitter.com/holodex"
      >
        <div class="i-carbon:logo-twitter" />
      </a>
      <a
        class="btn-outline btn-secondary btn p-0"
        title="Support us on Ko-Fi"
        href="https://ko-fi.com/holodex"
      >
        <div class="i-cib:ko-fi" />
      </a>
      <a
        class="btn-outline btn-primary btn p-0"
        title="Issues / Source Code"
        href="https://github.com/HolodexNet/Holodex"
      >
        <div class="i-carbon:logo-github" />
      </a>
      <a
        class="btn-outline btn-warning btn p-0"
        title="API Documentation"
        href="https://docs.holodex.net/docs/holodex/f4e6fa31af431-getting-started"
      >
        <div class="i-fluent:document-flowchart-20-regular" />
      </a>
      <a
        class="btn-outline btn border-purple-500 p-0 text-purple-500 hover:bg-purple-500"
        title="Holodex Discord"
        href="https://discord.gg/A24AbzgvRJ"
      >
        <div class="i-carbon:logo-discord" />
      </a>
    </div>
    <p class="mt-4 text-sm opacity-60">
      Holodex V3 internal UI test build [{{ abbreviatedSha }}]: compiled
      {{ committerDate }}.
    </p>
  </article>
</template>
<script setup>
import { abbreviatedSha, committerDate } from "~build/info";
</script>
<style>
#qlinks a {
  @apply flex max-w-xs flex-row flex-nowrap;
  margin-left: 0px;
  margin-right: 0px;
  padding: 0.5rem;
  text-decoration: none;
}
#qlinks a div {
  @apply mr-2 text-xl;
}
#qlinks a::after {
  content: attr(title);
  /*color: hsl(var(--p));*/
  font-size: 1rem;
  line-height: 1.25rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
  text-align: start;
  text-transform: none;
}
.prose p + p {
  margin-top: 0.5rem;
}
</style>
