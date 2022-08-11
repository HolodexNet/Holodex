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
  <div class="card bg-base-100" style="min-width: 200px">
    <div class="p-2 pt-4 card-body">
      <div v-if="user" class="flex flex-row">
        <div class="flex items-center justify-center p-2 pr-4">
          <img
            class="w-10 h-10"
            :src="`https://avatars.dicebear.com/api/jdenticon/${user.id}.svg`"
          />
        </div>
        <div class="flex flex-col">
          <div class="text-lg text-primary lighten-1">
            {{ user.username }}
          </div>
          <div class="flex flex-row gap-2 text-2xl">
            <div
              :class="
                icons.discord +
                (user.discord_id
                  ? ' text-primary lighten-2'
                  : '  text-background lighten-3')
              "
              class=""
            ></div>
            <div
              :class="
                icons.google +
                (user.google_id
                  ? ' text-primary lighten-2'
                  : '  text-background lighten-3')
              "
              class=""
            ></div>
            <div
              :class="
                icons.twitter +
                (user.twitter_id
                  ? ' text-primary lighten-2'
                  : '  text-background lighten-3')
              "
              class=""
            ></div>
          </div>
          <div class="text-sm text-secondary">
            <span v-if="user.role !== 'user'" class="font-bold capitalize">
              {{ user.role }} :
            </span>
            {{ user.contribution_count }} {{ $t("component.mainNav.points") }}
          </div>
        </div>
      </div>

      <ul class="gap-1 p-1 menu">
        <li v-if="!user">
          <router-link to="/login">
            <v-icon :icon="icons.mdiLoginVariant"></v-icon>
            {{ $t("component.mainNav.login") }}
          </router-link>
        </li>

        <div v-if="user && !inNavDrawer" class="my-0 divider" />
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
    </div>
  </div>
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
