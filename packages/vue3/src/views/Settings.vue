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
        <li :class="{ 'bordered active': tab === 0 }" @click="tab = 0">
          <a class="justify-center">Language</a>
        </li>
        <li :class="{ 'bordered active': tab === 1 }" @click="tab = 1">
          <a class="justify-center">Color Themes</a>
        </li>
        <li :class="{ 'bordered active': tab === 2 }" @click="tab = 2">
          <a class="justify-center">Homepage Filters</a>
        </li>
        <li :class="{ 'bordered active': tab === 3 }" @click="tab = 3">
          <a class="justify-center">Blocked Channels</a>
        </li>
        <li :class="{ 'bordered active': tab === 4 }" @click="tab = 4">
          <a class="justify-center">Advanced</a>
        </li>
        <!-- Default Click behavior etc. -->
      </ul>
    </div>
    <div
      class="flex-grow flex-shrink-0 p-3 rounded-md xs:max-w-full w-80 bg-bgColor"
      style="flex-basis: 60%; min-width: 300px"
    >
      <language-settings v-if="tab === 0" />
      <theme-settings v-else-if="tab === 1" />
    </div>
  </v-container>
</template>

<script lang="ts">
export default defineComponent({
  name: "About",
  components: {},
  data() {
    return {
      tab: 0,
    };
  },
});
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
