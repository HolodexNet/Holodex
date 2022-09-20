<template>
  <div class="text-lg font-bold">Join Holodex Discord:</div>
  <a href="">
    <img
      src="https://discordapp.com/api/guilds/796190073271353385/widget.png?style=banner2"
      width="280"
      class="rounded"
  /></a>
  <div class="mt-4 text-lg font-bold">DM us on Twitter</div>
  <a
    class="inline-block m-2"
    href="https://twitter.com/intent/follow?original_referer=https://holodex.net%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Eholodex&screen_name=holodex"
  >
    <img
      alt="Twitter Follow"
      src="https://img.shields.io/twitter/follow/holodex?color=%231d9bf0&logoColor=%231d9bf0"
    />
  </a>
  <a
    class="inline-block m-2"
    href="https://twitter.com/messages/compose?recipient_id=1320894663084048384&text=Hello"
  >
    <img
      alt="Twitter Message"
      src="https://img.shields.io/twitter/url?label=Message%20%40Holodex&style=social&url=https%3A%2F%2Fholodex.net"
  /></a>
  <div class="mt-4 text-lg font-bold">Email us:</div>
  <form class="mt-2">
    <div class="grid max-w-lg grid-cols-1 gap-4 md:grid-cols-2">
      <div class="z-0 shrink-0">
        <div class="w-full form-control">
          <label class="label">
            <span class="label-text">Name</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="Type here"
            class="w-full border-solid input input-bordered input-primary"
          />
        </div>
      </div>
      <div class="z-0 shrink-0">
        <div class="w-full form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Type here"
            class="w-full border-solid input input-bordered input-primary"
          />
        </div>
      </div>
      <div class="z-0 md:col-span-2">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Message</span>
          </label>
          <textarea
            class="h-24 border-solid textarea textarea-bordered textarea-primary"
            placeholder="..."
          ></textarea>
        </div>
      </div>
    </div>
    <!-- <button
      type="submit"
      class="px-10 py-2 mt-5 text-white bg-black rounded-md"
    >
      Send Message
    </button> -->
  </form>
</template>
<script></script>
