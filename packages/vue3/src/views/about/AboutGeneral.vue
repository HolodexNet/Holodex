<template>
  <article class="prose">
    <h3 class="mb-2 text-lg">What we are?</h3>
    <p>
      <b>Holodex</b> is a fan-built platform for watching VTubers. We are built
      by DD for DDs.
    </p>
    <holodex-stats></holodex-stats>
    <p>
      We organize clips and collabs by talents included, tabulate songs sang
      inside individual videos and as part of karaoke streams, compile agencies
      and groups by generation and branch, provide ways to favorite clips and
      streams, and allow you to watch livestreams with TLs (or produce TLs live
      or in VODs with community-caption-alike features).
    </p>
    <p>
      We comply with the Derivative Work Agreement of Hololive Productions and
      attempt to extend that to other orgs and agencies. We also operate within
      the specifications of Youtube Data API and Embed Player Terms of Service.
      Please reach out to us via Discord or Twitter DM for any service
      inquiries.
    </p>
    <h3 class="mt-6 mb-2 text-lg">Credits</h3>
    <p>
      Big shout out to Jet/HoloTools for helping us with the API and inspiring
      the Multiview.
    </p>
    <p>
      We'd like to thank our long list of contributors and over 100 editors:
    </p>
    <ul class="list-inside list-item indent-4">
      <li>RiceCakes (creator, admin)</li>
      <li>Xrave (admin)</li>
      <li>Uetchy (dev, designer)</li>
      <li>MadeT (designer)</li>
      <li>NeloBlivion (twitch support, editor)</li>
      <li>...</li>
      <!-- TBD -->
    </ul>
    <p class="text-sm opacity-60">
      (If you'd like to add your name to this list, drop us a poke on Discord!)
    </p>
    <h3 class="mt-4 text-lg">Quick Links</h3>
    <div id="qlinks">
      <a
        class="p-0"
        title="Follow us on twitter"
        href="https://twitter.com/holodex"
      >
        <div class="i-carbon:logo-twitter"></div>
      </a>
      <a
        class="p-0"
        title="Support us on Ko-Fi"
        href="https://ko-fi.com/holodex"
      >
        <div class="i-cib:ko-fi"></div>
      </a>
      <a class="p-0" title="Issues / Source Code">
        <div class="i-carbon:logo-github"></div>
      </a>
      <a class="p-0" title="API Documentation">
        <div class="i-fluent:document-flowchart-20-regular"></div>
      </a>
      <a class="p-0" title="Holodex Discord">
        <div class="i-carbon:logo-discord"></div>
      </a>
    </div>
  </article>
</template>
<style>
#qlinks a {
  @apply btn btn-link line-clamp-1 btn-wide;
  margin-left: 0px;
  margin-right: 0px;
  padding: 0.5rem;
  text-decoration: none;
}
#qlinks a div {
  @apply text-xl mr-2;
}
#qlinks a::after {
  content: attr(title);
  color: hsl(var(--p));
  font-size: 1rem;
  line-height: 1.25rem;
  display: block;
  width: 240px;
  text-align: start;
  text-transform: none;
}
.prose p + p {
  margin-top: 0.5rem;
}
</style>
