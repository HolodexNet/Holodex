<template>
  <v-container>
    <v-card-title>
      {{ $t("views.tlManager.title") }}
    </v-card-title>
    <v-card-actions class="d-flex">
      <v-btn @click="modalNexus = true; modalMode = 3;">
        <v-icon>
          {{ mdiFileMultiple }}
        </v-icon>
        Import From Mchad
      </v-btn>
      <v-btn style="margin-left:auto" @click="loadPrev()">
        <v-icon>
          {{ mdiArrowLeftBold }}
        </v-icon>
      </v-btn>
      <v-card-subtitle>
        {{ (query.offset + 1) + " ... " + (query.offset + query.limit) }}
      </v-card-subtitle>
      <v-btn @click="loadNext();">
        <v-icon>
          {{ mdiArrowRightBold }}
        </v-icon>
      </v-btn>
    </v-card-actions>
    <v-simple-table
      fixed-header
      height="70vh"
      width="auto"
    >
      <thead>
        <tr>
          <th class="text-left">
            {{ $t("views.tlManager.headerID") }}
          </th>
          <th class="text-left" style="width: 100%">
            {{ $t("views.tlManager.headerEntries") }}
          </th>
          <th class="text-left" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(dt, index) in tlData" :key="index">
          <td>{{ dt.video_id }}</td>
          <td>{{ dt.entry_count + " entries" }}</td>
          <td>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  v-bind="attrs"
                  v-on="on"
                  @click="openTlClient(dt.video_id)"
                >
                  <v-icon>
                    {{ mdiTypewriter }}
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t("component.videoCard.openScriptEditor") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  v-bind="attrs"
                  v-on="on"
                  @click="uploadClick(dt.video_id)"
                >
                  <v-icon>
                    {{ mdiClipboardArrowUpOutline }}
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t("component.videoCard.uploadScript") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  v-bind="attrs"
                  v-on="on"
                  @click="downloadClick(dt.video_id);"
                >
                  <v-icon>
                    {{ mdiDownload }}
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t("views.tlManager.download") }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  lg
                  v-bind="attrs"
                  v-on="on"
                  @click="deleteClick(dt.video_id);"
                >
                  <v-icon>
                    {{ mdiTrashCan }}
                  </v-icon>
                </v-btn>
              </template>
              <span>{{ $t("views.tlManager.delete") }}</span>
            </v-tooltip>
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <!---------   NEXUS MODAL ---------
      0 Upload
      1 Download
      2 Delete All
      3 Import MChad
    -->
    <v-dialog
      v-model="modalNexus"
      :max-width="dialogNexusWidth"
      :persistent="modalMode === 3"
    >
      <!---------    EXPORT ALL     --------->
      <v-card v-if="modalMode === 0">
        <UploadScript :video-data="videoData" @close="closeUpload" />
      </v-card>

      <!---------    EXPORT ALL     --------->
      <v-card v-if="modalMode === 1">
        <ExportFile :video-data="videoData" />
      </v-card>

      <!---------    Delete All     --------->
      <v-card v-if="modalMode === 2">
        <v-container>
          <v-card-title>
            {{ $t("views.tlManager.deleteTitle") }}
          </v-card-title>
          <v-select
            v-model="TLLang"
            :items="TL_LANGS"
            :item-text="item => item.text + ' (' + item.value + ')'"
            item-value="value"
            :label="$t('views.tlManager.langPick')"
            return-object
            @change="reloadDeleteEntries();"
          />
          <v-card-subtitle>
            {{ modalText }}
          </v-card-subtitle>
          <v-card-actions>
            <v-btn @click="modalNexus = false">
              {{ $t("views.tlClient.cancelBtn") }}
            </v-btn>

            <v-btn style="margin-left:auto" color="error" @click="clearAll()">
              {{ $t("views.tlManager.delete") }}
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>

      <!---------    IMPORT MCHAD     --------->
      <v-card v-if="modalMode === 3">
        <ImportMchad @close="closeUpload" />
      </v-card>
    </v-dialog>
    <!--========   NEXUS MODAL =======-->
  </v-container>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import { mdiTypewriter, mdiClipboardArrowUpOutline, mdiTrashCan, mdiDownload, mdiArrowRightBold, mdiArrowLeftBold, mdiFileMultiple } from "@mdi/js";
import { TL_LANGS } from "@/utils/consts";
import ExportFile from "@/components/tlscriptmanager/ExportToFile.vue";
import UploadScript from "@/components/tlscriptmanager/UploadScript.vue";
import ImportMchad from "@/components/tlscriptmanager/ImportMchad.vue";

export default {
    name: "TLManager",
    metaInfo() {
        return {
            get title() {
                return "TLManager - Holodex";
            },
        };
    },
    components: {
        ExportFile,
        UploadScript,
        ImportMchad,
    },
    data() {
        return {
            mdiTypewriter,
            mdiClipboardArrowUpOutline,
            mdiDownload,
            mdiTrashCan,
            mdiArrowRightBold,
            mdiArrowLeftBold,
            mdiFileMultiple,
            tlData: [],
            modalNexus: false,
            modalMode: 0,
            selectedID: -1,
            TLLang: TL_LANGS[0],
            TL_LANGS,
            modalText: "",
            entries: [],
            query: {
                limit: 20,
                offset: 0,
            },
            videoData: undefined,
        };
    },
    computed: {
        userdata() {
            return this.$store.state.userdata;
        },
        dialogNexusWidth() {
            switch (this.modalMode) {
                case 2: return ("300px");
                case 3: return ("95vw");
                default: return ("600px");
            }
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.name": function () {
            if (this.$route.name === "scriptmanager") {
                this.tlData = [];
                this.reloadData();
            }
        },
    },
    mounted() {
        this.reloadData();
    },
    methods: {
        reloadData() {
            backendApi.getTLStats(this.userdata.jwt, this.query).then(({ status, data }) => {
                if (status === 200) {
                    this.tlData = data;
                    this.modalNexus = false;
                }
            }).catch((err) => {
                console.log(err);
            });
        },
        openTlClient(ID) {
            if (this.$store.state.userdata?.user) {
                this.$router.push({ path: "/scripteditor", query: { video: `YT_${ID}` } });
            } else {
                this.$router.push({ path: "/login" });
            }
        },
        deleteClick(ID) {
            this.modalNexus = true;
            this.modalMode = 2;
            this.selectedID = ID;
            this.reloadDeleteEntries();
        },
        downloadClick(ID) {
            backendApi.video(ID, this.TLLang.value).then(({ status, data }) => {
                if (status === 200) {
                    this.videoData = {
                        id: ID,
                        start_actual: !data.start_actual ? Date.parse(data.available_at) : Date.parse(data.start_actual),
                        title: data.title,
                    };
                    this.modalNexus = true;
                    this.modalMode = 1;
                    this.selectedID = ID;
                }
            }).catch((err) => {
                console.log(err);
            });
        },
        uploadClick(ID) {
            backendApi.video(ID, this.TLLang.value).then(({ status, data }) => {
                if (status === 200) {
                    this.videoData = {
                        id: ID,
                        start_actual: !data.start_actual ? Date.parse(data.available_at) : Date.parse(data.start_actual),
                        title: data.title,
                    };
                    this.modalNexus = true;
                    this.modalMode = 0;
                    this.selectedID = ID;
                }
            }).catch((err) => {
                console.log(err);
            });
        },
        closeUpload(e) {
            if (e.upload) {
                this.reloadData();
            }
            this.modalNexus = false;
        },
        loadNext() {
            if (this.tlData.length >= this.query.limit) {
                this.tlData = [];
                this.query.offset += 20;
                this.reloadData();
            }
        },
        loadPrev() {
            this.tlData = [];
            if (this.query.offset - 20 < 0) {
                this.query.offset = 0;
            } else {
                this.query.offset -= 20;
            }
            this.reloadData();
        },
        reloadDeleteEntries() {
            backendApi.chatHistory(this.selectedID, {
                lang: this.TLLang.value,
                verified: 0,
                moderator: 0,
                vtuber: 0,
                limit: 100000,
                mode: 1,
                creator_id: this.userdata.user.id,
            }).then(({ status, data }) => {
                if (status === 200) {
                    this.entries = data.map((e) => e.id);
                    this.modalText = `${this.entries.length} entries`;
                }
            }).catch((err) => {
                console.log(err);
            });
        },
        clearAll() {
            const processes = this.entries.map((e) => ({
                type: "Delete",
                data: {
                    id: e,
                },
            }));

            backendApi.postTLLog(this.selectedID, this.userdata.jwt, processes, this.TLLang.value).then(({ status }) => {
                if (status === 200) {
                    this.reloadData();
                    this.modalNexus = false;
                }
            }).catch((err) => {
                console.log(`ERR : ${err}`);
            });
        },
    },
};
</script>

<style>
td {
    white-space: nowrap;
}
</style>
