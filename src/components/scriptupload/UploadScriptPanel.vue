<template>
  <v-dialog v-model="show" max-width="80%" max-height="500px">
    <v-card elevation="5">
      <v-container>
        <v-card-title>
          Upload Script
        </v-card-title>
        <v-file-input
          accept=".ass, .TTML, .srt"
          :prepend-icon="mdiFileDocument"
          outlined
          dense
          @change="fileChange"
        />
        <v-card-text>{{ notifText }}</v-card-text>
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
                Start
              </th>
              <th class="text-left">
                End
              </th>
              <th class="text-left" style="width: 100%">
                Text
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
                @click.native="selectedEntry = index;"
              />
            </template>
          </tbody>
        </v-simple-table>

        <v-card-actions>
          <v-btn @click="show=false">
            Cancel
          </v-btn>

          <v-btn style="margin-left:auto" :disabled="!parsed" @click="sendData()">
            Ok
          </v-btn>
        </v-card-actions>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import { mdiFileDocument } from "@mdi/js";
import Entrytr from "@/components/scriptupload/Entrytr.vue";

export default {
    components: {
        Entrytr,
    },
    props: {
        value: Boolean,
        video: Object,
    },
    data() {
        return {
            mdiFileDocument,
            parsed: false,
            entries: [],
            profileContainer: [],
            notifText: "",
        };
    },
    computed: {
        show: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit("input", value);
            },
        },
    },
    methods: {
        fileChange(e) {
            this.parsed = false;
            this.entries = [];
            this.profileContainer = [];
            this.notifText = "";
            if (!e) {
                return;
            }
            this.notifText = "Parsing file...";
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
                this.notifText = "Unrecognized file extension.";
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
                this.notifText = "UNABLE TO PARSE THE FILE (FILE CORRUPTED?)";
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
                this.notifText = "UNABLE TO PARSE THE FILE (FILE CORRUPTED?)";
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
                this.notifText = "UNABLE TO PARSE THE FILE (FILE CORRUPTED?)";
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
                                            /*
                        cc: this.profileContainer[i].CC,
                        oc: this.profileContainer[i].OC
                        */
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
                this.notifText = "UNABLE TO PARSE THE FILE (FILE CORRUPTED?)";
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
        sendData() {
            console.log(this.entries);
        },
    },
};
</script>
