<!-- This component is no longer used -->

<template>
    <v-dialog persistent v-model="dialog">
        <template v-slot:activator="{ on }">
            <div class="multi-button d-inline-block">
                <v-btn color="blue" :disabled="!topic" small>
                    <v-icon left>{{ icons.mdiAnimationPlay }}</v-icon>
                    {{ topic || "Topic Not Set" }}
                </v-btn>
                <v-btn
                    v-if="videoId && showEditIfPossible && (role === 'admin' || role === 'editor')"
                    color="white"
                    class="blue darken-2"
                    elevation="2"
                    icon
                    v-on="on"
                    small
                >
                    <v-icon>{{ icons.mdiPencil }}</v-icon>
                </v-btn>
            </div>
        </template>
        <!-- <v-card v-if="role=== 'editor' || role === 'admin'"> -->
        <v-card>
            <v-card-title>
                <v-icon left>{{ icons.mdiAnimationPlay }}</v-icon>
                <h5>Change stream topic</h5>
            </v-card-title>
            <v-card-text>
                <v-select :items="topics" label="Topic (leave empty to unset)" v-model="newTopic"></v-select>
            </v-card-text>
            <v-card-actions>
                <!-- <v-spacer></v-spacer> -->
                <v-btn color="blue darken-1" text @click="dialog = false"> Close </v-btn>
                <v-btn color="blue darken-1" text @click="saveTopic"> Save </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import * as icons from "@/utils/icons";
import backendApi from "@/utils/backend-api";

export default {
    props: {
        topic: {
            type: String,
            required: false,
        },
        videoId: {
            type: String,
            required: false,
        },
        showEditIfPossible: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            dialog: false,
            newTopic: null,
            icons,
            topics: [],
        };
    },
    watch: {
        dialog() {
            if (this.dialog && this.topics.length === 0) this.populateMethods();
        },
    },
    computed: {
        role() {
            return this.$store.state.userdata?.user?.role;
        },
    },
    methods: {
        async populateMethods() {
            this.topics = (await backendApi.topics()).data.map((topic) => ({
                value: topic.id,
                text: `${topic.id} (${topic.count ?? 0})`,
            }));
        },
        saveTopic() {
            this.dialog = false;
            backendApi.topicSet(this.newTopic, this.videoId, this.$store.state.userdata.jwt);
            this.topic = this.newTopic;
        },
    },
};
</script>

<style lang="scss">
.multi-button {
    //   padding: 8px 10px;
    border-radius: 50px;
    //   background: #fff;
    //   border: .5px solid hsla(228,16%,63%,0.4);
    //   box-shadow: 0 0 10px hsla(228,16%,63%,0.2), 4px 4px 10px hsla(228,16%,63%,0.2);
    cursor: default;
    button {
        border: 0 solid transparent;
        background: transparent;
        padding: 10px 30px;
        margin: 0 0px;
        color: #273043;
        font-size: 17px;
        border-radius: 0px;
        cursor: pointer;
        position: relative;
        top: 0;
        left: 0;
        outline: none;
        transition: background 0.2s ease-in-out;
        &:first-child {
            border-top-left-radius: 40px;
            border-bottom-left-radius: 40px;
        }
        &:last-child {
            border-top-right-radius: 40px;
            border-bottom-right-radius: 40px;
        }
    }
}
</style>
