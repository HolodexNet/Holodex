<template>
  <v-container>
    <v-card-title>
      {{ $t("views.watch.uploadPanel.title") }}
    </v-card-title>
    <v-card-subtitle>
      {{ $t("views.watch.uploadPanel.usernameText") + ' : ' + userdata.user.username + ' ' }}
      <a style="text-decoration: underline; font-size: 0.7em" @click="changeUsernameClick()">{{ $t("views.watch.uploadPanel.usernameChange") }}</a>
    </v-card-subtitle>
    <v-file-input
      ref="fileInput"
      accept=".ass, .TTML, .srt"
      :prepend-icon="mdiFileDocument"
      outlined
      dense
      @change="fileChange"
    />
    <v-card-text>{{ notifText }}</v-card-text>
    <v-select
      v-model="TLLang"
      :items="TL_LANGS"
      :item-text="item => item.text + ' (' + item.value + ')'"
      item-value="value"
      :label="$t('views.tlManager.langPick')"
      return-object
    />
    <v-simple-table
      v-if="entries.length > 0"
      fixed-header
      dense
      height="40vh"
      width="auto"
    >
      <thead>
        <tr>
          <th class="text-left">
            {{ $t("views.watch.uploadPanel.headerStart") }}
          </th>
          <th class="text-left">
            {{ $t("views.watch.uploadPanel.headerEnd") }}
          </th>
          <th class="text-left" style="width: 100%">
            {{ $t("views.watch.uploadPanel.headerText") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(entry, index) in entries">
          <Entrytr
            :key="index"
            :time="entry.timestamp"
            :duration="entry.duration"
            :stext="entry.message"
            :cc="entry.cc ? entry.cc : ''"
            :oc="entry.oc ? entry.oc : ''"
          />
        </template>
      </tbody>
    </v-simple-table>

    <v-card-actions>
      <v-btn @click="$emit('close', {upload: false});">
        {{ $t("views.watch.uploadPanel.cancelBtn") }}
      </v-btn>

      <v-btn
        style="margin-left:auto"
        :disabled="!parsed"
        color="error"
        @click="sendData()"
      >
        {{ $t("views.scriptEditor.importFile.overwriteBtn") }}
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script>
import { mdiFileDocument } from "@mdi/js";
import Entrytr from "@/components/tlscriptmanager/Entrytr.vue";
import backendApi from "@/utils/backend-api";
import { TL_LANGS } from "@/utils/consts";

export default {
    components: {
        Entrytr,
    },
    props: {
        videoData: Object,
    },
    data() {
        return {
            TL_LANGS,
            mdiFileDocument,
            parsed: false,
            entries: [],
            profileContainer: [],
            notifText: "",
            TLLang: TL_LANGS[0],
        };
    },
    computed: {
        userdata() {
            return this.$store.state.userdata;
        },
        startTime() {
            if (!this.videoData.start_actual) {
                return (Date.parse(this.videoData.available_at));
            }
            if (Number.isNaN(Number(this.videoData.start_actual))) {
                return (Date.parse(this.videoData.start_actual));
            }
            return (this.videoData.start_actual);
        },
    },
    watch: {
        videoData() {
            this.$refs.fileInput.reset();
            this.parse = false;
            this.notifText = "";
            this.entries = [];
        },
    },
    methods: {
        changeUsernameClick() {
            this.$router.push({ path: "/login" });
        },
        fileChange(e) {
            this.parsed = false;
            this.entries = [];
            this.profileContainer = [];
            this.notifText = "";
            if (!e) {
                return;
            }
            this.notifText = this.$t("views.watch.uploadPanel.notifTextParsing");
            const reader = new FileReader();

            if ((/\.ass$/i).test(e.name)) {
                reader.onload = (res) => {
                    this.parseAss(res.target.result);
                };
                reader.readAsText(e);
            } else if ((/\.srt$/i).test(e.name)) {
                reader.onload = (res) => {
                    this.parseSrt(res.target.result);
                };
                reader.readAsText(e);
            } else if ((/\.ttml$/i).test(e.name)) {
                reader.onload = (res) => {
                    this.parseTtml(res.target.result);
                };
                reader.readAsText(e);
            } else {
                this.notifText = this.$t("views.watch.uploadPanel.notifTextErrExt");
            }
        },
        parseAss(dataFeed) {
            const res = dataFeed.split("\n");
            let fail = true;
            let lineSplit;
            let locationIndex;
            let dataLength;

            for (let index = 0; index < res.length; index += 1) {
                if (res[index].search(/\[V4\+ Styles\]/gi) !== -1) {
                    index += 1;
                    if (res[index].search(/^Format/gi) !== -1) {
                        lineSplit = res[index].split(":")[1].split(",").map((e) => (e.trim()));
                        locationIndex = [];
                        dataLength = lineSplit.length;

                        if (lineSplit.indexOf("Name") !== -1) {
                            locationIndex.push(lineSplit.indexOf("Name"));
                        }
                        if (lineSplit.indexOf("PrimaryColour") !== -1) {
                            locationIndex.push(lineSplit.indexOf("PrimaryColour"));
                        }
                        if (lineSplit.indexOf("OutlineColour") !== -1) {
                            locationIndex.push(lineSplit.indexOf("OutlineColour"));
                        }

                        if (locationIndex.length === 3) {
                            fail = false;
                            for (index += 1; index < res.length; index += 1) {
                                if (res[index].search(/^Style/gi) !== -1) {
                                    lineSplit = res[index].split(":")[1].split(",").map((e) => (e.trim()));
                                    if (lineSplit.length === dataLength) {
                                        if ((lineSplit[locationIndex[1]].length === 10) && (lineSplit[locationIndex[2]].length === 10)) {
                                            this.profileContainer.push({
                                                Name: lineSplit[locationIndex[0]].trim(),
                                                CC: lineSplit[locationIndex[1]].trim().substr(8, 2) + lineSplit[locationIndex[1]].trim().substr(6, 2) + lineSplit[locationIndex[1]].trim().substr(4, 2),
                                                OC: lineSplit[locationIndex[2]].trim().substr(8, 2) + lineSplit[locationIndex[2]].trim().substr(6, 2) + lineSplit[locationIndex[2]].trim().substr(4, 2),
                                            });
                                        } else {
                                            fail = true;
                                            index = res.length;
                                        }
                                    } else {
                                        fail = true;
                                        index = res.length;
                                    }
                                } else {
                                    index = res.length;
                                }
                            }
                        } else {
                            index = res.length;
                        }
                    } else {
                        index = res.length;
                    }
                }
            }

            if (fail) {
                this.notifText = this.$t("views.watch.uploadPanel.notifTextErr");
                return;
            }
            fail = true;

            for (let index = 0; index < res.length; index += 1) {
                if (res[index].search(/\[Events\]/gi) !== -1) {
                    index += 1;
                    if (res[index].search(/^Format/gi) !== -1) {
                        lineSplit = res[index].split(":")[1].split(",").map((e) => (e.trim()));
                        locationIndex = [];
                        dataLength = lineSplit.length;

                        if (lineSplit.indexOf("Start") !== -1) {
                            locationIndex.push(lineSplit.indexOf("Start"));
                        }
                        if (lineSplit.indexOf("End") !== -1) {
                            locationIndex.push(lineSplit.indexOf("End"));
                        }
                        if (lineSplit.indexOf("Style") !== -1) {
                            locationIndex.push(lineSplit.indexOf("Style"));
                        }
                        if (lineSplit.indexOf("Text") !== -1) {
                            locationIndex.push(lineSplit.indexOf("Text"));
                        }

                        if (locationIndex.length === 4) {
                            fail = false;
                            for (index += 1; index < res.length; index += 1) {
                                if (res[index].search(/^Dialogue/gi) !== -1) {
                                    lineSplit = res[index].split("Dialogue:")[1].split(",");
                                    if (lineSplit.length >= dataLength) {
                                        for (let index2 = 0; index2 < this.profileContainer.length; index2 += 1) {
                                            if (lineSplit[locationIndex[2]].trim() === this.profileContainer[index2].Name) {
                                                let textSend = lineSplit[locationIndex[3]];
                                                for (let z = locationIndex[3] + 1; z < lineSplit.length; z += 1) {
                                                    textSend += `,${lineSplit[z]}`;
                                                }

                                                const timeSplit = lineSplit[locationIndex[0]].trim().split(":");
                                                let msShift = timeSplit[2].split(".")[1];
                                                if (msShift.length === 2) {
                                                    msShift += "0";
                                                } else if (msShift.length === 1) {
                                                    msShift += "00";
                                                }
                                                const startTime = Number.parseInt(timeSplit[0], 10) * 60 * 60 * 1000 + Number.parseInt(timeSplit[1], 10) * 60 * 1000 + Number.parseInt(timeSplit[2].split(".")[0], 10) * 1000 + Number.parseInt(msShift, 10);

                                                const timeSplit2 = lineSplit[locationIndex[1]].trim().split(":");
                                                let msShift2 = timeSplit2[2].split(".")[1];
                                                if (msShift2.length === 2) {
                                                    msShift2 += "0";
                                                } else if (msShift2.length === 1) {
                                                    msShift2 += "00";
                                                }
                                                const endTime = Number.parseInt(timeSplit2[0], 10) * 60 * 60 * 1000 + Number.parseInt(timeSplit2[1], 10) * 60 * 1000 + Number.parseInt(timeSplit2[2].split(".")[0], 10) * 1000 + Number.parseInt(msShift2, 10);

                                                this.entries.push({
                                                    message: textSend,
                                                    timestamp: startTime,
                                                    duration: endTime - startTime,
                                                });
                                                break;
                                            }
                                        }
                                    } else {
                                        index = res.length;
                                    }
                                } else {
                                    index = res.length;
                                }
                            }
                        } else {
                            index = res.length;
                        }
                    } else {
                        index = res.length;
                    }
                }
            }

            if (fail) {
                this.notifText = this.$t("views.watch.uploadPanel.notifTextErr");
            } else {
                this.notifText = `Parsed ASS file, ${this.profileContainer.length} profiles, ${this.entries.length} Entries.`;
                this.parsed = true;
            }
        },
        parseTtml(dataFeed) {
            let fail = true;
            let startIndex;
            let endIndex;
            let penEnd;
            let target;
            let endTarget;

            if ((dataFeed.indexOf("<head>") !== -1) && (dataFeed.indexOf("</head>") !== -1)) {
                startIndex = dataFeed.indexOf("<head>");
                endIndex = dataFeed.indexOf("</head>");

                fail = false;

                for (let penStart = dataFeed.indexOf("<pen", startIndex); penStart < endIndex; penStart = dataFeed.indexOf("<pen", penStart)) {
                    if (penStart === -1) {
                        break;
                    }

                    penEnd = dataFeed.indexOf(">", penStart);
                    target = -1;
                    endTarget = -1;
                    const tempProfileContainer = {
                        Name: "",
                        CC: "",
                        OC: "",
                    };

                    if ((penEnd > endIndex) || (penEnd === -1)) {
                        fail = true;
                        break;
                    }

                    target = dataFeed.indexOf("id=\"", penStart);
                    if ((target > penEnd) || (target === -1)) {
                        fail = true;
                        break;
                    }
                    endTarget = dataFeed.indexOf("\"", target + 4);
                    if ((endTarget > penEnd) || (endTarget === -1)) {
                        fail = true;
                        break;
                    }
                    tempProfileContainer.Name = dataFeed.substring(target + 4, endTarget);

                    target = dataFeed.indexOf("fc=\"", penStart);
                    if ((target === -1) || (target > penEnd)) {
                        tempProfileContainer.CC = "";
                    } else {
                        endTarget = dataFeed.indexOf("\"", target + 5);
                        if ((endTarget > penEnd) || (endTarget === -1)) {
                            fail = true;
                            break;
                        }
                        tempProfileContainer.CC = dataFeed.substring(target + 5, endTarget);
                    }

                    target = dataFeed.indexOf("ec=\"", penStart);
                    if ((target === -1) || (target > penEnd)) {
                        tempProfileContainer.OC = "";
                    } else {
                        endTarget = dataFeed.indexOf("\"", target + 5);
                        if ((endTarget > penEnd) || (endTarget === -1)) {
                            fail = true;
                            break;
                        }
                        tempProfileContainer.OC = dataFeed.substring(target + 5, endTarget);
                    }

                    this.profileContainer.push(tempProfileContainer);
                    penStart = penEnd;
                }
            }

            if (fail) {
                this.notifText = this.$t("views.watch.uploadPanel.notifTextErr");
                return;
            }
            fail = true;

            if ((dataFeed.indexOf("<body>") !== -1) && (dataFeed.indexOf("</body>") !== -1)) {
                startIndex = dataFeed.indexOf("<body>");
                endIndex = dataFeed.indexOf("</body>");
                const entryContainer = {
                    message: "",
                    timestamp: 0,
                    duration: 0,
                    CC: undefined,
                    OC: undefined,
                };

                fail = false;

                for (let penStart = dataFeed.indexOf("<p", startIndex); penStart < endIndex; penStart = dataFeed.indexOf("<p", penStart)) {
                    if (penStart === -1) {
                        break;
                    }

                    penEnd = dataFeed.indexOf("</p>", penStart);

                    if ((penEnd > endIndex) || (penEnd === -1)) {
                        fail = true;
                        break;
                    }

                    let startClosure = -1;
                    let endClosure = -1;
                    target = -1;
                    endTarget = -1;
                    let target2 = -1;
                    let endTarget2 = -1;

                    //  GET TIME
                    startClosure = penStart;
                    endClosure = dataFeed.indexOf(">", startClosure);
                    if ((endClosure === -1) || (endClosure > penEnd)) {
                        fail = true;
                        break;
                    }

                    target = dataFeed.indexOf("t=\"", startClosure);
                    if ((target > endClosure) || (target === -1)) {
                        fail = true;
                        break;
                    }
                    endTarget = dataFeed.indexOf("\"", target + 3);
                    if ((endTarget > endClosure) || (endTarget === -1)) {
                        fail = true;
                        break;
                    }

                    target2 = dataFeed.indexOf("d=\"", startClosure);
                    if ((target2 > endClosure) || (target2 === -1)) {
                        fail = true;
                        break;
                    }
                    endTarget2 = dataFeed.indexOf("\"", target2 + 3);
                    if ((endTarget2 > endClosure) || (endTarget2 === -1)) {
                        fail = true;
                        break;
                    }

                    if (Number.isNaN(Number.parseInt(dataFeed.substring(target + 3, endTarget), 10)) || Number.isNaN(Number.parseInt(dataFeed.substring(target2 + 3, endTarget2), 10))) {
                        fail = true;
                        break;
                    } else if (entryContainer.timestamp !== Number.parseInt(dataFeed.substring(target + 3, endTarget), 10)) {
                        entryContainer.timestamp = Number.parseInt(dataFeed.substring(target + 3, endTarget), 10);
                        entryContainer.duration = Number.parseInt(dataFeed.substring(target2 + 3, endTarget2), 10) - entryContainer.timestamp;

                        // LOOK FOR NON EMPTY SPAN
                        startClosure = endClosure;
                        for (startClosure = dataFeed.indexOf("<s", startClosure); startClosure < penEnd; startClosure = dataFeed.indexOf("<s", startClosure)) {
                            if (startClosure === -1) {
                                break;
                            }

                            endClosure = dataFeed.indexOf(">", startClosure);
                            if ((endClosure === -1) || (endClosure > penEnd)) {
                                penStart = endIndex;
                                fail = true;
                                break;
                            }

                            const spanEnd = dataFeed.indexOf("</s>", endClosure);
                            if ((spanEnd === -1) || (spanEnd > penEnd)) {
                                penStart = endIndex;
                                fail = true;
                                break;
                            }

                            if (dataFeed.substring(endClosure + 1, spanEnd).trim().length > 1) {
                                entryContainer.message = dataFeed.substring(endClosure + 1, spanEnd).trim();

                                target = dataFeed.indexOf("p=\"", startClosure);
                                if ((target > endClosure) || (target === -1)) {
                                    fail = true;
                                    break;
                                }
                                endTarget = dataFeed.indexOf("\"", target + 3);
                                if ((endTarget > endClosure) || (endTarget === -1)) {
                                    fail = true;
                                    break;
                                }

                                for (let i = 0; i < this.profileContainer.length; i += 1) {
                                    if (this.profileContainer[i].Name === dataFeed.substring(target + 3, endTarget)) {
                                        this.entries.push({
                                            message: dataFeed.substring(endClosure + 1, spanEnd).trim(),
                                            timestamp: entryContainer.timestamp,
                                            duration: entryContainer.duration,
                                        });
                                        endClosure = penEnd;
                                        break;
                                    }
                                }
                            }
                            startClosure = endClosure;
                        }
                    }

                    if (penStart !== endIndex) {
                        penStart = penEnd;
                    }
                }
            }

            if (fail) {
                this.notifText = this.$t("views.watch.uploadPanel.notifTextErr");
            } else {
                this.notifText = `Parsed TTML file, ${this.profileContainer.length} colour profiles, ${this.entries.length} Entries.`;
                this.parsed = true;
            }
        },
        checkTimeString(testString) {
            let timeSplit = testString.split(":");
            if (timeSplit.length !== 3) {
                return (false);
            }

            if (Number.isNaN(Number.parseInt(timeSplit[0], 10))) {
                return (false);
            }

            if (Number.isNaN(Number.parseInt(timeSplit[1], 10)) || (Number.parseInt(timeSplit[1], 10) > 60)) {
                return (false);
            }

            timeSplit = timeSplit[2].split(",");

            if (timeSplit.length !== 2) {
                return (false);
            }

            if (Number.isNaN(Number.parseInt(timeSplit[0], 10)) || (Number.parseInt(timeSplit[0], 10) > 60)) {
                return (false);
            }

            if (Number.isNaN(Number.parseInt(timeSplit[1], 10)) || (Number.parseInt(timeSplit[1], 10) > 1000)) {
                return (false);
            }
            return (true);
        },
        srtTimeCheck(timeString) {
            if (timeString.split("-->").length !== 2) {
                return (false);
            } if ((this.checkTimeString(timeString.split("-->")[0].trim())) && (this.checkTimeString(timeString.split("-->")[1].trim()))) {
                return (true);
            }
            return (false);
        },
        parseTimeString(targetString) {
            let res = 0;
            let timeSplit = targetString.split(":");

            res = res + Number.parseInt(timeSplit[0], 10) * 3600000 + Number.parseInt(timeSplit[1], 10) * 60000;
            timeSplit = timeSplit[2].split(",");
            res += Number.parseInt(timeSplit[0], 10) * 1000 + Number.parseInt(timeSplit[1], 10);

            return (res);
        },
        parseSrt(dataFeed) {
            const res = dataFeed.split("\n");
            let write = false;

            for (let index = 0; index < res.length; index += 1) {
                if (this.srtTimeCheck(res[index])) {
                    const startTime = this.parseTimeString(res[index].split("-->")[0].trim());
                    const endTime = this.parseTimeString(res[index].split("-->")[1].trim());
                    let text = "";
                    write = true;

                    for (index += 1; index < res.length; index += 1) {
                        if (this.srtTimeCheck(res[index])) {
                            index -= 1;
                            write = false;
                            this.entries.push({
                                message: text,
                                timestamp: startTime,
                                duration: endTime - startTime,
                            });
                            break;
                        } else if (res[index] === "") {
                            write = false;
                            this.entries.push({
                                message: text,
                                timestamp: startTime,
                                duration: endTime - startTime,
                            });
                            break;
                        } else if (index === res.length - 1) {
                            if (res[index].trim() !== "") {
                                text += res[index];
                            }
                            write = false;
                            this.entries.push({
                                message: text,
                                timestamp: startTime,
                                duration: endTime - startTime,
                            });
                            break;
                        } else if (res[index].trim() !== "") {
                            if (write === true) {
                                if (text !== "") {
                                    text = `${text} `;
                                }
                                text += res[index];
                            }
                        } else {
                            write = false;
                        }
                    }
                }

                if (index === res.length - 1) {
                    this.notifText = `Parsed SRT file, ${this.entries.length} Entries.`;
                    this.parsed = true;
                }
            }
        },
        async sendData() {
            if (this.userdata.user.api_key) {
                const processes = await (await backendApi.chatHistory(this.videoData.id, {
                    lang: this.TLLang.value,
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

                for (let idx = 0; idx < this.entries.length; idx += 1) {
                    processes.push({
                        type: "Add",
                        data: {
                            tempid: `I${idx}`,
                            name: this.userdata.user.username,
                            timestamp: Math.floor(this.startTime + this.entries[idx].timestamp),
                            message: this.entries[idx].message,
                            duration: Math.floor(this.entries[idx].duration),
                        },
                    });
                }

                backendApi.postTLLog(this.videoData.id, this.userdata.user.api_key, processes, this.TLLang.value).then(({ status }) => {
                    if (status === 200) {
                        this.$emit("close", { upload: true });
                    }
                }).catch((err) => {
                    console.log(`ERR : ${err}`);
                });
            } else {
                this.notifText = "It seems that you still don't have API KEY, go to account setting (in the same login/logout menu) then click get new API key on the bottom";
            }
        },
    },
};
</script>
