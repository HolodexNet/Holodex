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
  <div class="card bg-bgColor" style="min-width: 200px">
    <div class="card-body p-0">
      <div
        v-if="user"
        class="flex cursor-pointer flex-row p-2 hover:bg-bgColor-300"
        @click="$router.push({ path: '/settings/user' })"
      >
        <div class="flex items-center justify-center p-2 pr-4">
          <img
            class="h-10 w-10"
            :src="`https://avatars.dicebear.com/api/jdenticon/${user.id}.svg`"
          />
        </div>
        <div class="flex flex-col">
          <div class="text-lg font-bold">
            {{ user.username }}
          </div>
          <div class="flex flex-row gap-2 text-2xl">
            <div
              :class="
                icons.discord +
                (user.discord_id ? ' text-primary-400' : '  text-gray-400')
              "
              class=""
            ></div>
            <div
              :class="
                icons.google +
                (user.google_id ? ' text-primary-400' : '  text-gray-400')
              "
              class=""
            ></div>
            <div
              :class="
                icons.twitter +
                (user.twitter_id ? ' text-primary-400' : '  text-gray-400')
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

      <ul class="menu gap-1 p-1">
        <li v-if="!user">
          <router-link to="/login">
            <h-icon class="i-mdi:login-variant h-6 w-6"></h-icon>
            {{ $t("component.mainNav.login") }}
          </router-link>
        </li>

        <div v-if="user && !inNavDrawer" class="divider my-0" />
        <li
          v-if="
            user &&
            !inNavDrawer &&
            $route.name !== 'Settings_User' &&
            $route.name !== 'Login'
          "
        >
          <router-link to="/settings/user">
            <h-icon
              class="i-material-symbols:manage-accounts-rounded h-6 w-6"
            ></h-icon>
            {{ $t("component.mainNav.accountSettings") }}
          </router-link>
        </li>
        <li v-if="user && !inNavDrawer">
          <a class="text-warning" @click.prevent.stop="logout">
            <h-icon class="i-mdi:logout-variant h-6 w-6"></h-icon>
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
  inNavDrawer: Boolean,
});

const site = useSiteStore();
const user = computed(() => site.user);
const { logout } = useClient();
</script>

<style></style>
