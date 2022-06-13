<template>
  <v-app>
    <main-nav></main-nav>
    <!-- <v-navigation-drawer app>
      <template v-for="(menuItem, index) in menuList" :key="index">
        <router-link :to="menuItem.link || '/'">
          <v-btn>{{ menuItem.label }}</v-btn>
        </router-link>
      </template>

    </v-navigation-drawer> -->

    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <!-- If using vue-router -->
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>

<script setup>
import { RouterView, RouterLink } from "vue-router";

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
</script>
