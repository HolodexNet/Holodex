<template>

  <v-container class="page">

    <template v-for="(menuItem, index) in menuList" :key="index">
      <router-link :to="menuItem.link || '/'">
        <v-btn>{{ menuItem.label }}</v-btn>
      </router-link>
    </template>


    <v-btn block flat color="info" class="mt-3" to="/about-us">
      Go To About Us
    </v-btn>

    <router-view />

  </v-container>
</template>

<script setup lang="ts">

import { RouterView, RouterLink } from 'vue-router';

const menuList = [
  {
    icon: "inbox",
    label: "Users",
    separator: true,
    link: "/",
  },
  {
    icon: "send",
    label: "Projects",
    link: "/projects",
    separator: false,
  },
  {
    icon: "delete",
    label: "Profiles",
    link: "/profiles",
    separator: false,
  },
  {
    icon: "error",
    label: "Spam",
    separator: true,
  },
  {
    icon: "settings",
    label: "Settings",
    separator: false,
  },
  {
    icon: "feedback",
    label: "Send Feedback",
    separator: false,
  },
  {
    icon: "help",
    iconColor: "primary",
    label: "Help",
    separator: false,
  },
];

defineProps({
  msg: String,
});

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

</script>

