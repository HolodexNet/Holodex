<template>
    <div>
        <v-navigation-drawer v-model="drawer" app width="256">
            <v-list dense>
                <v-list-item link :to="'/'">
                    <v-list-item-action>
                        <v-icon>mdi-home</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Home</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link>
                    <v-list-item-action>
                        <!-- <v-icon>mdi-home</v-icon> -->
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Channels</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item link>
                    <v-list-item-action>
                        <!-- <v-icon>mdi-home</v-icon> -->
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>FAQ</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <!-- <v-list-item link>
                    <v-list-item-action>
                        <v-icon>mdi-email</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Contact</v-list-item-title>
                    </v-list-item-content>
                </v-list-item> -->
            </v-list>
        </v-navigation-drawer>
        <v-app-bar color="white" app elevate-on-scroll>
            <v-app-bar-nav-icon
                @click.stop="drawer = !drawer"
            ></v-app-bar-nav-icon>
            <v-toolbar-title class="pr-5">
                <router-link
                    :to="'/'"
                    style="text-decoration: none; color: inherit"
                >
                    Holoclips
                </router-link>
            </v-toolbar-title>
            <!-- <v-btn to="/" text>
            Home
        </v-btn> -->
            <v-spacer></v-spacer>

            <v-btn icon>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon>mdi-heart</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
        </v-app-bar>
    </div>
</template>

<script>
export default {
    data: () => ({
        drawer: null,
    }),
};
</script>

<style></style>
