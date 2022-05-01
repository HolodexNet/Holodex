<template>
  <v-container>
    <v-card-title>Import From Mchad</v-card-title>
    <v-card class="d-flex flex-column">
      <div class="d-flex flex-row">
        <v-text-field
          v-model="room"
          label="Room name"
          outlined
        />
        <v-text-field
          v-model="pass"
          label="Password"
          type="password"
          style="margin-left:7px"
          outlined
        />
      </div>
      <v-btn width="100%" color="success" @click="tryFetchMChad();">
        {{ $t("component.mainNav.login") }}
      </v-btn>
      <v-card-subtitle>
        {{ loginText }}
      </v-card-subtitle>
    </v-card>
    <v-simple-table
      fixed-header
      dense
      height="40vh"
      width="auto"
    >
      <thead>
        <tr>
          <th class="text-left" style="width: 20%;">
            Title
          </th>
          <th class="text-left" style="width: 55%;">
            Stream Link
          </th>
          <th class="text-left" style="width: 15%;">
            Language
          </th>
          <th class="text-left">
            Entry Length
          </th>
          <th class="text-left">
            Status
          </th>
          <th class="text-left">
            <v-icon>{{ mdiCloseBox }}</v-icon>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(dt, index) in archiveData">
          <tr :key="index + 'dt'">
            <td>{{ dt.nick }}</td>
            <td>
              <v-text-field
                v-model="dt.streamLink"
                label="Stream Link"
              />
            </td>
            <td>
              <v-select
                v-model="dt.lang"
                :items="TL_LANGS"
                :item-text="item => item.text + ' (' + item.value + ')'"
                item-value="value"
                label="Language"
                single-line
                return-object
              />
            </td>
            <td>{{ dt.entries.length }}</td>
            <td>
              <v-icon v-if="dt.uploaded === 1" color="success">
                {{ mdiCheckCircle }}
              </v-icon>
              <v-icon v-else-if="dt.uploaded === 0" color="error">
                {{ mdiCloseCircle }}
              </v-icon>
              <v-icon v-else-if="dt.uploaded === -1">
                {{ mdiDotsCircle }}
              </v-icon>
              <v-icon v-else color="warning">
                {{ mdiMinusCircle }}
              </v-icon>
            </td>
            <td>
              <v-icon style="cursor:pointer;" color="error" @click="archiveData.splice(index, 1);">
                {{ mdiCloseBox }}
              </v-icon>
            </td>
          </tr>
          <tr v-if="dt.errorMsg !== ''" :key="index + 'err'">
            <td colspan="6">
              {{ dt.errorMsg }}
            </td>
          </tr>
        </template>
      </tbody>
    </v-simple-table>
    <v-card-actions>
      <v-btn @click="$emit('close', {upload: false}); resetData();">
        {{ $t("views.watch.uploadPanel.cancelBtn") }}
      </v-btn>

      <v-btn
        style="margin-left:auto"
        color="error"
        :disabled="(archiveData.length === 0) || (working)"
        @click="sendData()"
      >
        {{ working ? "Processing" : "Upload" }}
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>
import backendApi from "@/utils/backend-api";
import { TL_LANGS } from "@/utils/consts";
import { getVideoIDFromUrl } from "@/utils/functions";
import { mdiMinusCircle, mdiDotsCircle, mdiCloseCircle, mdiCheckCircle, mdiCloseBox } from "@mdi/js";

export default {
    data() {
        return {
            mdiMinusCircle,
            mdiDotsCircle,
            mdiCloseCircle,
            mdiCheckCircle,
            mdiCloseBox,
            TL_LANGS,
            room: "",
            pass: "",
            loginText: "",
            archiveData: [],
            working: false,
            /*
                streamLink:
                entries:
                nick:
                uploaded: -2 No, -1 processing, 0 Err, 1 Ok
                lang:
                errorMsg:
            */
        };
    },
    computed: {
        userdata() {
            return this.$store.state.userdata;
        },
    },
    methods: {
        resetData() {
            this.room = "";
            this.pass = "";
            this.loginText = "";
            this.archiveData = [];
            this.working = false;
        },
        tryFetchMChad() {
            this.loginText = "";
            this.archiveData = [];
            backendApi.fetchMChadData(this.room, this.pass).then((data) => {
                if (data.status !== 200) {
                    this.room = "";
                    this.pass = "";
                    this.loginText = data.data;
                } else {
                    this.room = "";
                    this.pass = "";
                    this.archiveData = data.data.map((e) => {
                        let lang;
                        if (e.Tags) {
                            const tagList = e.Tags.split(",").map((e2) => (e2.trim().toLowerCase()));
                            for (let i = 0; i < tagList.length; i += 1) {
                                if (TL_LANGS.map((e2) => (e2.value.toLowerCase())).includes(tagList[i])) {
                                    [lang] = TL_LANGS.filter((e2) => (e2.value.toLowerCase() === tagList[i]));
                                    break;
                                }
                            }
                        }
                        return {
                            streamLink: e.StreamLink ? e.StreamLink : "",
                            entries: e.Entries.Entries ? this.preprocessEntries(e.Entries.Entries) : [],
                            nick: e.Nick ? e.Nick : "",
                            uploaded: -2,
                            lang: lang || TL_LANGS[0],
                            errorMsg: "",
                        };
                    });
                }
            }).catch((err) => {
                this.room = "";
                this.pass = "";
                this.loginText = err.response.data;
            });
        },
        preprocessEntries(entries) {
            if (entries.length === 0) {
                return (entries);
            }

            const startText = entries.filter((e) => (e.Stext.match(/--.*Stream.*Start.*--/i) != null));
            if (startText.length === 0) {
                if (entries[0].Stime === 0) {
                    return (entries);
                }
                const startTime = entries[0].Stime;
                return (entries.map((e) => {
                    e.Stime -= startTime;
                    return (e);
                }));
            }
            const startIndex = entries.map((e) => (e.Stext)).indexOf(startText[0]);
            entries.splice(0, startIndex);
            const startTime = entries[0].Stime;
            return (entries.map((e) => {
                e.Stime -= startTime;
                return (e);
            }));
        },
        async sendData() {
            if (!this.working) {
                this.working = true;

                for (let i = 0; i < this.archiveData.length; i += 1) {
                    // I KNOW THIS IS WEIRD, BUT ESLINT WON'T ALLOW ME USE continue;

                    // CHECK IF UPLOADED
                    if (this.archiveData[i].uploaded !== 1) {
                        // CHECK ENTRIES
                        if (!this.archiveData[i].entries.length === 0) {
                            this.archiveData[i].uploaded = 1;
                        } else {
                            // CHECK STREAM LINK
                            this.archiveData[i].uploaded = -1;
                            const parseVideoID = getVideoIDFromUrl(this.archiveData[i].streamLink);
                            if (!parseVideoID) {
                                this.archiveData[i].errorMsg = "Invalid stream link";
                                this.archiveData[i].uploaded = 0;
                            } else {
                                // FETCH VIDEO INFO
                                let res = await backendApi.video(parseVideoID.id, this.archiveData[i].lang.value);
                                if (res.status !== 200) {
                                    this.archiveData[i].errorMsg = "Unable to fetch video data";
                                    this.archiveData[i].uploaded = 0;
                                } else {
                                    const startTime = !res.data.start_actual ? Date.parse(res.data.available_at) : Date.parse(res.data.start_actual);

                                    // GET CURRENT TL AND LOG DELETE
                                    const processes = await (await backendApi.chatHistory(parseVideoID.id, {
                                        lang: this.archiveData[i].lang.value,
                                        verified: 0,
                                        moderator: 0,
                                        vtuber: 0,
                                        limit: 100000,
                                        mode: 1,
                                        creator_id: this.userdata.user.id,
                                    })).data.map((e) => ({
                                        type: "Delete",
                                        data: {
                                            id: e.id,
                                        },
                                    }));

                                    // ADD NEW TL
                                    for (let idx = 0; idx < this.archiveData[i].entries.length; idx += 1) {
                                        processes.push({
                                            type: "Add",
                                            data: {
                                                tempid: `I${idx}`,
                                                name: this.userdata.user.username,
                                                timestamp: Math.floor(startTime + this.archiveData[i].entries[idx].Stime),
                                                message: this.archiveData[i].entries[idx].Stext,
                                            },
                                        });
                                    }

                                    res = await backendApi.postTLLog(parseVideoID.id, this.userdata.jwt, processes, this.archiveData[i].lang.value);
                                    if (res.status !== 200) {
                                        this.archiveData[i].errorMsg = "Fail uploading data";
                                        this.archiveData[i].uploaded = 0;
                                    } else {
                                        this.archiveData[i].uploaded = 1;
                                        this.archiveData[i].errorMsg = "";
                                    }
                                }
                            }
                        }
                    }
                }

                if (this.archiveData.filter((e) => (e.uploaded !== 1)).length !== 0) {
                    this.archiveData = this.archiveData.filter((e) => (e.uploaded !== 1));
                    this.working = false;
                } else {
                    this.resetData();
                    this.$emit("close", { upload: true });
                }
            }
        },
    },
};
</script>
