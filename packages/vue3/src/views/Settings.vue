<template>
  <v-container
    key="settingspg"
    class="flex flex-row flex-wrap items-stretch gap-2 pt-3"
  >
    <div
      id="setting-menu"
      class="flex-grow rounded-md bg-bgColor"
      style="flex-basis: 160px; min-width: 160px"
    >
      <ul class="w-full menu">
        <li :class="{ 'bordered active': route.name === 'Settings_Language' }">
          <router-link to="/settings/lang" class="justify-center"
            >Language</router-link
          >
        </li>
        <li :class="{ 'bordered active': route.name === 'Settings_Themes' }">
          <router-link to="/settings/themes" class="justify-center"
            >Color Themes</router-link
          >
        </li>
        <li :class="{ 'bordered active': route.name === 'Settings_Homepage' }">
          <router-link to="/settings/homepage" class="justify-center"
            >Homepage & Filters</router-link
          >
        </li>
        <li :class="{ 'bordered active': route.name === 'Settings_Blocked' }">
          <router-link to="/settings/blocked" class="justify-center"
            >Blocked Channels</router-link
          >
        </li>
        <li :class="{ 'bordered active': route.name === 'Settings_Advanced' }">
          <router-link to="/settings/advanced" class="justify-center"
            >Advanced</router-link
          >
        </li>
        <!-- Default Click behavior etc. -->
      </ul>
    </div>
    <div
      class="flex-grow flex-shrink-0 p-3 rounded-md xs:max-w-full w-80 bg-bgColor"
      style="flex-basis: 60%; min-width: 300px"
    >
      <router-view></router-view>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
const route = useRoute();
</script>

<style>
#setting-menu .menu .active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* stop moving center align when clicked */
#setting-menu li:not(:where(.bordered)) a {
  border-left-width: 4px;
  border-left-color: transparent;
}
</style>
