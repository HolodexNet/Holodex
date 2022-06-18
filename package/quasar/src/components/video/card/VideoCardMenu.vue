<template>
  <div class="bg-transparent dropdown dropdown-end" @click.prevent.stop>
    <label tabindex="0" class="m-1 border-none btn-outline btn-ghost btn btn-circle">          <v-icon left>
      {{ icons.mdiDotsVertical }}
    </v-icon>
    </label>
    <ul tabindex="0" class="p-1 rounded-sm shadow dropdown-content menu bg-neutral w-52">
      <li>
        <a>        
          <v-icon left>
            {{ icons.mdiYoutube }}
          </v-icon>
          {{ $t("views.settings.redirectModeLabel") }}
        </a>
      </li>
      <li><a>Item 2</a></li>
    </ul>
  </div>
</template>

<style>
.video-card-menu {
    position: absolute;
    right: 0px;
    display: inline-block;
    top: 5px;
    z-index: 1;
}
</style>