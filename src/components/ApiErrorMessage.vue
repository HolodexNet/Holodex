<template>
    <v-row>
        <v-col class="ma-auto text-center pa-8">
            Error while retrieving lives... If this is unexpected, please check
            twitter (<a href="https://twitter.com/holodex" norel>@holodex</a>)
            or report an error on the
            <router-link to="/about">About page</router-link>.
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: "ApiErrorMessage",
};
</script>

<style></style>
