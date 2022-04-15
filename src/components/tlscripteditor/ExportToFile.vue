<template>
  <v-container>
    <h2 style="width:100%; text-align: center;">
      {{ $t("views.scriptEditor.menu.exportFile") }}
    </h2>
    <h4 style="width:100%; text-align: center; margin-top:10px">
      {{ entries.length + " entries, " + profile.length + " profile." }}
    </h4>
    <v-card-actions class="justify-center" style="margin-top:10px">
      <v-btn
        color="primary"
        @click="exportSrt()"
      >
        .srt
      </v-btn>
      <v-btn
        color="primary"

        @click="exportAss()"
      >
        .ass
      </v-btn>
      <v-btn
        color="primary"
        @click="exportTTML()"
      >
        .ttml
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script lang="ts">

export default {
    name: "ExportToFile",
    props: {
        entries: Array,
        profile: Array,
        title: String,
    },
    methods: {
        stringifyTime(time: number, mode: boolean): string {
            let timeStamp = time;
            let timeString = "";
            let stringTime = 0;
            let tempString = "";

            stringTime = Math.floor(timeStamp / 3600000);
            tempString = stringTime.toString();

            if (tempString.length < 2) {
                tempString = `0${tempString}`;
            }

            timeString += `${tempString}:`;
            timeStamp -= stringTime * 3600000;

            stringTime = Math.floor(timeStamp / 60000);
            tempString = stringTime.toString();

            if (tempString.length < 2) {
                tempString = `0${tempString}`;
            }

            timeString += `${tempString}:`;
            timeStamp -= stringTime * 60000;

            stringTime = Math.floor(timeStamp / 1000);
            tempString = stringTime.toString();

            if (tempString.length < 2) {
                tempString = `0${tempString}`;
            }
            timeString += tempString;
            timeStamp -= stringTime * 1000;

            if (mode) {
                timeString += ",";
            } else {
                timeString += ".";
            }

            timeString += timeStamp.toString();
            return (timeString);
        },
        exportAss() {
            let writeStream = "";

            writeStream += "[V4+ Styles]\n";
            writeStream += "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n";

            for (let i = 0; i < this.profile.length; i += 1) {
                writeStream += `Style: ${this.profile[i].Name},Arial,20,&H00`;

                if (this.profile[i].useCC) {
                    writeStream += this.profile[i].CC.substring(5, 7) + this.profile[i].CC.substring(3, 5) + this.profile[i].CC.substring(1, 3);
                } else {
                    writeStream += "FFFFFF";
                }

                writeStream += ",&H00000000,&H00";

                if (this.profile[i].useOC) {
                    writeStream += this.profile[i].OC.substring(5, 7) + this.profile[i].OC.substring(3, 5) + this.profile[i].OC.substring(1, 3);
                } else {
                    writeStream += "000000";
                }

                writeStream += ",&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1\n";
            }

            writeStream += "\n[Events]\n";
            writeStream += "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";

            for (let i = 0; i < this.entries.length; i += 1) {
                writeStream += `Dialogue: 0,${this.stringifyTime(this.entries[i].Time, false)},`;

                if (i === this.entries.length - 1) {
                    writeStream += `${this.stringifyTime(this.entries[i].Time + 3000, false)},`;
                } else {
                    writeStream += `${this.stringifyTime(this.entries[i].Time + this.entries[0].Duration, false)},`;
                }

                writeStream += `${this.profile[this.entries[i].Profile].Name},`;
                writeStream += `,0,0,0,,${this.entries[i].SText}\n`;
            }

            const blob = new Blob([writeStream], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${this.title}.ass`;
            link.click();
            link.remove();
        },
        exportTTML() {
            let writeStream = "";

            writeStream += "<?xml version=\"1.0\" encoding=\"utf-8\"?><timedtext format=\"3\">\n"
                + "\t<head>\n"
                + "\t\t<wp id=\"0\" ap=\"7\" ah=\"0\" av=\"0\" />\n"
                + "\t\t<wp id=\"1\" ap=\"7\" ah=\"50\" av=\"100\" />\n"
                + "\t\t<ws id=\"0\" ju=\"2\" pd=\"0\" sd=\"0\" />\n"
                + "\t\t<ws id=\"1\" ju=\"2\" pd=\"0\" sd=\"0\" />\n\n"
                + "\t\t<pen id=\"0\" sz=\"100\" fc=\"#000000\" fo=\"0\" bo=\"0\" />\n"
                + "\t\t<pen id=\"1\" sz=\"0\" fc=\"#A0AAB4\" fo=\"0\" bo=\"0\" />\n";

            for (let i = 0; i < this.profile.length; i += 1) {
                writeStream += `\t\t<pen id="${((i * 2) + 2).toString()}" sz="100" fc="`;
                if (this.profile[i].useCC) {
                    writeStream += this.profile[i].CC;
                } else {
                    writeStream += "#FFFFFF";
                }

                writeStream += "\" fo=\"254\" et=\"4\" ec=\"";
                if (this.profile[i].useOC) {
                    writeStream += this.profile[i].OC;
                } else {
                    writeStream += "#000000";
                }

                writeStream += "\" />\n";
                writeStream += `\t\t<pen id="${((i * 2) + 3).toString()}" sz="100" fc="`;
                if (this.profile[i].useCC) {
                    writeStream += this.profile[i].CC;
                } else {
                    writeStream += "#FFFFFF";
                }

                writeStream += "\" fo=\"254\" et=\"3\" ec=\"";
                if (this.profile[i].useOC) {
                    writeStream += this.profile[i].OC;
                } else {
                    writeStream += "#000000";
                }

                writeStream += "\" />\n";
            }

            writeStream += "\t</head>\n\n\t<body>\n";

            for (let i = 0; i < this.entries.length; i += 1) {
                writeStream += `\t\t<p t="${
                    (this.entries[i].Time + 1).toString()
                }" d="`;

                if (i === this.entries.length - 1) {
                    writeStream += `${(this.entries[i].Time + 3001).toString()}"`;
                } else {
                    writeStream += `${(this.entries[i].Time + 1 + this.entries[i].Duration).toString()}"`;
                }

                writeStream += " wp=\"1\" ws=\"1\"><s p=\"1\"></s><s p=\"";

                writeStream += `${((this.entries[i].Profile * 2) + 2).toString()}"> ${this.entries[i].SText} </s><s p="1"></s></p>\n`;

                writeStream += `\t\t<p t="${
                    (this.entries[i].Time + 1).toString()
                }" d="`;

                if (i === this.entries.length - 1) {
                    writeStream += `${(this.entries[i].Time + 3001).toString()}"`;
                } else {
                    writeStream += `${(this.entries[i].Time + 1 + this.entries[i].Duration).toString()}"`;
                }

                writeStream += " wp=\"1\" ws=\"1\"><s p=\"1\"></s><s p=\"";

                writeStream += `${((this.entries[i].Profile * 2) + 3).toString()}"> ${this.entries[i].SText} </s><s p="1"></s></p>\n`;
            }

            writeStream += "\t</body>\n</timedtext>";

            const blob = new Blob([writeStream], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${this.title}.ttml`;
            link.click();
            link.remove();
        },
        exportSrt() {
            let writeStream = "";

            for (let i = 0; i < this.entries.length; i += 1) {
                writeStream += `${(i + 1).toString()}\n`;
                writeStream += `${this.stringifyTime(this.entries[i].Time, true)} --> `;
                if (i === this.entries.length - 1) {
                    writeStream += `${this.stringifyTime(this.entries[i].Time + 3000, true)}\n`;
                } else {
                    writeStream += `${this.stringifyTime(this.entries[i].Time + this.entries[i].Duration, true)}\n`;
                }
                writeStream += `${this.entries[i].SText}\n\n`;
            }

            const blob = new Blob([writeStream], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${this.title}.srt`;
            link.click();
            link.remove();
        },
    },
};
</script>

<style>
</style>
