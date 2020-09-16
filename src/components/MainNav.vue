<template>
    <div>
        <v-navigation-drawer v-model="drawer" app width="256" clipped>
            <v-list dense>
                <v-list-item link :to="'/'">
                    <v-list-item-action>
                        <v-icon>{{ mdiHome }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Home</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link :to="'/channel'">
                    <v-list-item-action>
                        <v-icon>{{ mdiAnimationPlay }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Channels</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link>
                    <v-list-item-action>
                        <v-icon>{{ mdiHelpCircle }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>About</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link>
                    <v-list-item-action>
                        <v-icon>{{ mdiCog }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Settings</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar color="blue lighten-2" app clipped-left flat>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer">
                <v-icon>{{ mdiMenu }}</v-icon>
            </v-app-bar-nav-icon>
            <v-toolbar-title class="pr-5">
                <router-link
                    :to="'/'"
                    style="text-decoration: none; color: white"
                >
                    HoloSubs
                </router-link>
            </v-toolbar-title>

            <v-text-field
                flat
                hide-details
                label="Search"
                :prepend-inner-icon="mdiMagnify"
                solo-inverted
                style="max-width: 500px"
                class="ma-auto"
            ></v-text-field>
        </v-app-bar>
    </div>
</template>

<script>
import {
    mdiHome,
    mdiAnimationPlay,
    mdiHelpCircle,
    mdiCog,
    mdiMagnify,
    mdiMenu,
} from "@mdi/js";
export default {
    data: () => ({
        drawer: null,
        ...{
            mdiHome,
            mdiAnimationPlay,
            mdiHelpCircle,
            mdiCog,
            mdiMagnify,
            mdiMenu,
        },
    }),
};
</script>

<style></style>
