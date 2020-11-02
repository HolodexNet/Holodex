<template>
    <v-row>
        <v-col class="ma-auto text-center pa-8">
            <div class="text-h4">Gomenasorry!</div>
            <div class="text-body-1">
                There was an error retrieving content, please check twitter (<a
                    href="https://twitter.com/holodex"
                    norel
                    >@holodex</a
                >) or report an error through the
                <router-link to="/about">About page</router-link>.
            </div>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: "ApiErrorMessage",
};
</script>

<style></style>
