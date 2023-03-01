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
    <div class="p-0">
      <div
        v-if="user"
        class="m-1 mb-0 flex cursor-pointer flex-row rounded hover:bg-bgColor-200"
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
            />
            <div
              :class="
                icons.google +
                (user.google_id ? ' text-primary-400' : '  text-gray-400')
              "
              class=""
            />
            <div
              :class="
                icons.twitter +
                (user.twitter_id ? ' text-primary-400' : '  text-gray-400')
              "
              class=""
            />
          </div>
          <div class="text-sm text-secondary">
            <span v-if="user.role !== 'user'" class="font-bold capitalize">
              {{ user.role }} :
            </span>
            {{ user.contribution_count }} {{ $t("component.mainNav.points") }}
          </div>
        </div>
      </div>
      <h-list class="gap-1 p-1">
        <h-list-item v-if="!user" to="/login">
          <h-icon class="i-mdi:login-variant h-6 w-6" />
          {{ $t("component.mainNav.login") }}
        </h-list-item>
        <h-divider v-if="user && !inNavDrawer" class="" />
        <h-list-item
          v-if="
            user &&
            !inNavDrawer &&
            $route.name !== 'Settings_User' &&
            $route.name !== 'Login'
          "
          to="/settings/user"
        >
          <h-icon class="i-material-symbols:manage-accounts-rounded h-6 w-6" />
          {{ $t("component.mainNav.accountSettings") }}
        </h-list-item>
        <h-list-item
          v-if="user && !inNavDrawer"
          class="text-warning"
          @click.prevent.stop="logout"
        >
          <h-icon class="i-mdi:logout-variant h-6 w-6" />
          {{ $t("component.mainNav.logout") }}
        </h-list-item>
      </h-list>
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
