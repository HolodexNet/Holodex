<template>
  <tr>
    <td>{{ timeStampStart }}</td>
    <td>{{ timeStampEnd }}</td>
    <td>{{ profileName }}</td>
    <td class="EntryContainer" :style="textStyle" colspan="2">
      <span style="word-wrap:break-word">
        {{ stext }}
      </span>
    </td>
  </tr>
</template>

<script lang="ts">
export default {
    name: "Entrytr",
    props: {
        time: {
            type: Number,
            default: 0,
        },
        duration: {
            type: Number,
            default: 0,
        },
        profileName: {
            type: String,
            default: "",
        },
        stext: {
            type: String,
            default: "",
        },
        cc: {
            type: String,
            default: "",
        },
        oc: {
            type: String,
            default: "",
        },
    },
    computed: {
        timeStampStart() {
            let timeRaw = this.time;
            let timeString = "";

            let t = Math.floor(timeRaw / 60 / 60 / 1000);
            timeRaw -= t * 60 * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 60 / 1000);
            timeRaw -= t * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 1000);
            timeRaw -= t * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ".";

            if (timeRaw > 100) {
                timeString += timeRaw.toString().slice(0, 2);
            } else if (timeRaw > 10) {
                timeString += `0${timeRaw.toString().slice(0, 1)}`;
            } else {
                timeString += "00";
            }

            return timeString;
        },
        timeStampEnd() {
            let timeRaw = this.time + this.duration;
            let timeString = "";

            let t = Math.floor(timeRaw / 60 / 60 / 1000);
            timeRaw -= t * 60 * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 60 / 1000);
            timeRaw -= t * 60 * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ":";

            t = Math.floor(timeRaw / 1000);
            timeRaw -= t * 1000;
            if (t < 10) {
                timeString += `0${t.toString()}`;
            } else {
                timeString += t.toString();
            }
            timeString += ".";

            if (timeRaw > 100) {
                timeString += timeRaw.toString().slice(0, 2);
            } else if (timeRaw > 10) {
                timeString += `0${timeRaw.toString().slice(0, 1)}`;
            } else {
                timeString += "00";
            }

            return timeString;
        },
        textStyle() {
            return {
                "-webkit-text-fill-color": (this.cc === "") ? "unset" : this.cc,
                "-webkit-text-stroke-color": (this.oc === "") ? "unset" : this.oc,
                "-webkit-text-stroke-width": (this.oc === "") ? "0px" : "1px",
            };
        },
    },
};
</script>

<style>
.EntryContainer {
    font-weight: bold;
}
</style>
