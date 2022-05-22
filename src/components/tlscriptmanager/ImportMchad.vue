<template>
  <v-container>
    <v-card-title>Import From Mchad</v-card-title>
    <v-alert
      v-if="claimSuccess"
      type="success"
      dismissible
    >
      Successfully claimed all imported archives from Mchad
    </v-alert>
    <v-alert
      v-if="claimErrorMsg"
      type="error"
      dismissible
    >
      {{ claimErrorMsg }}
    </v-alert>
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
      <v-btn width="100%" color="success" @click="checkAvailable();">
        {{ $t("component.mainNav.login") }} to Mchad
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
          <th>
            #
          </th>
          <th class="text-left" style="width: 55%;">
            Video Id
          </th>
          <th class="text-left">
            Entry Length
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(dt, index) in archiveData">
          <tr :key="index + 'dt'">
            <td>{{ index + 1 }}</td>
            <!-- <td>{{ dt.nick }}</td> -->
            <td>
              {{ dt.video_id }}
            </td>
            <!-- <td>
              <v-select
                v-model="dt.lang"
                :items="TL_LANGS"
                :item-text="item => item.text + ' (' + item.value + ')'"
                item-value="value"
                label="Language"
                single-line
                return-object
              />
            </td> -->
            <td>{{ dt.count }}</td>
          </tr>
          <!-- <tr v-if="dt.errorMsg !== ''" :key="index + 'err'">
            <td colspan="6">
              {{ dt.errorMsg }}
            </td>
          </tr> -->
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
        @click="claimAll"
      >
        {{ working ? "Processing" : "Claim All Archives" }}
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>
import backendApi from "@/utils/backend-api";
import { TL_LANGS } from "@/utils/consts";

export default {
    data() {
        return {
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
            currPage: 0,
            roomSave: "",
            passSave: "",

            claimErrorMsg: "",
            claimSuccess: false,
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
            this.claimSuccess = false;
            this.claimErrorMsg = "";
        },
        async checkAvailable() {
            try {
                this.working = true;
                if (!(this.room && this.pass)) throw new Error("Missing room or pass");
                const res = await backendApi.checkMchadMigrate(this.room, this.pass);
                this.archiveData = res.data;
            } catch (e) {
                this.claimErrorMsg = e.message;
            }
            this.working = false;
        },
        async claimAll() {
            try {
                this.working = true;
                const res = await backendApi.claimMchadMigrate(this.userdata?.jwt, this.room, this.pass);
                if (res.status === 200) {
                    this.claimSuccess = true;
                }
            } catch (error) {
                this.claimErrorMsg = error.response?.data?.message || error.message;
            }
            this.working = false;
        },
    },
};
</script>
