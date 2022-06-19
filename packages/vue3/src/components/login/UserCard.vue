<template>
  <!-- Menu Card -->
  <!--
*  General goal: show User / prompt login.
*
*  If logged in: (in no particular order)
*     show user name, contributions.
*     # of favorited channels
*     log out button
*     settings page link
*
*  If not logged in:
*     social login buttons
*     settings page link
*
*
  -->
  <v-sheet>
    <div v-if="user" class="flex flex-row py-4">
      <div class="flex justify-center items-center p-2 pr-4">
        <img
          class="w-10 h-10"
          :src="`https://avatars.dicebear.com/api/jdenticon/${user.id}.svg`"
        />
      </div>
      <div class="flex flex-col">
        <v-list-item-title>{{ user.username }}</v-list-item-title>
        <v-list-item-subtitle>
          <span v-if="user.role !== 'user'" class="capitalize">
            {{ user.role }}
          </span>
          &nbsp;
          <v-icon
            size="small"
            :color="user.discord_id ? 'green lighten-2' : 'grey'"
          >
            {{ icons.mdiDiscord }}
          </v-icon>
          &nbsp;
          <v-icon
            size="small"
            :color="user.google_id ? 'green lighten-2' : 'grey'"
          >
            {{ icons.mdiGoogle }}
          </v-icon>
          &nbsp;
          <v-icon
            size="small"
            :color="user.twitter_id ? 'green lighten-2' : 'grey'"
          >
            {{ icons.mdiTwitter }}
          </v-icon>
          &nbsp;
        </v-list-item-subtitle>
        <v-list-item-content class="primary--text">
          <v-icon size="x-small">
            {{ icons.mdiStarFourPointsOutline }}
          </v-icon>
          {{ user.contribution_count }} {{ $t("component.mainNav.points") }}
        </v-list-item-content>
      </div>
    </div>

    <ul class="gap-1 p-2 menu">
      <li v-if="!user">
        <router-link to="/login">
          <v-icon :icon="icons.mdiLoginVariant"></v-icon>
          {{ $t("component.mainNav.login") }}
        </router-link>
      </li>

      <v-divider v-if="user && !inNavDrawer" />
      <li v-if="user && !inNavDrawer">
        <router-link to="/login">
          <v-icon :icon="icons.mdiAccountCircleOutline"></v-icon>
          {{ $t("component.mainNav.accountSettings") }}
        </router-link>
      </li>
      <li v-if="!noSetting">
        <router-link to="/settings">
          <v-icon :icon="icons.mdiCog"></v-icon>
          {{ $t("component.mainNav.settings") }}
        </router-link>
      </li>
      <li v-if="user && !inNavDrawer">
        <a @click.prevent="logout">
          <v-icon :icon="icons.mdiLogoutVariant"></v-icon>
          {{ $t("component.mainNav.logout") }}
        </a>
      </li>
    </ul>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useClient } from "@/hooks/auth/client";
import { useSiteStore } from "@/stores";

defineProps({
  noSetting: Boolean,
  inNavDrawer: Boolean,
});

const site = useSiteStore();
const user = computed(() => site.user);
const { logout } = useClient();
</script>

<style></style>
