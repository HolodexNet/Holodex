<template>
  <div key="settingspg" class="flex flex-row flex-wrap items-stretch gap-2 p-4">
    <div
      id="setting-menu"
      class="h-fit flex-grow rounded-md bg-bgColor"
      style="flex-basis: 160px; min-width: 160px"
    >
      <ul class="menu w-full rounded-md">
        <li :class="{ 'active bordered': route.name === 'Settings_Language' }">
          <router-link to="/settings/lang" class="justify-center">
            Language
          </router-link>
        </li>
        <li :class="{ 'active bordered': route.name === 'Settings_Themes' }">
          <router-link to="/settings/themes" class="justify-center">
            Color Themes
          </router-link>
        </li>
        <li :class="{ 'active bordered': route.name === 'Settings_User' }">
          <router-link to="/settings/user" class="justify-center">
            Account Settings
          </router-link>
        </li>
        <li :class="{ 'active bordered': route.name === 'Settings_Homepage' }">
          <router-link to="/settings/homepage" class="justify-center">
            Homepage & Filters
          </router-link>
        </li>
        <li :class="{ 'active bordered': route.name === 'Settings_Blocked' }">
          <router-link to="/settings/blocked" class="justify-center">
            Blocked Channels
          </router-link>
        </li>
        <li :class="{ 'active bordered': route.name === 'Settings_Advanced' }">
          <router-link to="/settings/advanced" class="justify-center">
            Advanced
          </router-link>
        </li>
        <!-- Default Click behavior etc. -->
      </ul>
    </div>
    <div
      class="xs:max-w-full w-80 flex-shrink-0 flex-grow rounded-md bg-bgColor p-3"
      style="flex-basis: 60%; min-width: 300px"
    >
      <router-view/>
    </div>
  </div>
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
