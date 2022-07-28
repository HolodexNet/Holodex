<template>
  <v-app>
    <main-nav />
    <!-- <v-navigation-drawer app>
      <template v-for="(menuItem, index) in menuList" :key="index">
        <router-link :to="menuItem.link || '/'">
          <v-btn>{{ menuItem.label }}</v-btn>
        </router-link>
      </template>

    </v-navigation-drawer> -->

    <!-- Sizes your content based upon application components -->
    <v-main class="bg-base-300">
      <!-- Provides the application the proper gutter -->
      <!-- If using vue-router -->
      <router-view />
    </v-main>

    <v-footer app>
      <!-- -->
    </v-footer>
  </v-app>
</template>
