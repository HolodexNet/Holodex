<template>
  <q-layout view="hHh Lpr fFf">

    <q-header class="bg-primary text-white" height-hint="30">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Title
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/page1" label="Page One" />
        <q-route-tab to="/page2" label="Page Two" />
        <q-route-tab to="/page3" label="Page Three" />
      </q-tabs>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area class="fit">
        <!-- <localization-manager></localization-manager> -->
        <q-list>
          <template v-for="(menuItem, index) in menuList" :key="index">
            <q-item clickable :to="menuItem.link" :active="menuItem.label === 'Outbox'">
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator v-if="menuItem.separator" :key="'sep' + index" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <router-view />
      </q-page>
    </q-page-container>

    <q-footer reveal elevated class="bg-grey-8 text-white" v-model="$q.screen.lt.md">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          <div>Title</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>

<script setup lang="ts">

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

const $q = useQuasar()
</script>

