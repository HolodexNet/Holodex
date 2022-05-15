<template>
  <v-container fill-height fluid>
    <v-card
      v-if="!loggedIn"
      class="d-flex justify-center"
      width="100%"
      height="100%"
    >
      <v-btn
        color="primary"
        elevation="9"
        large
        :href="discordOAuth2Links"
      >
        login discord
      </v-btn>
      <v-btn
        color="secondary"
        elevation="9"
        large
        style="margin-left:10px"
        href="https://discord.com/api/oauth2/authorize?client_id=826055534318583858&permissions=274877910016&scope=bot%20applications.commands"
      >
        Invite bot
      </v-btn>
    </v-card>
    <v-card
      v-if="loggedIn"
      class="d-flex flex-row"
      width="100%"
      height="100%"
    >
      <v-card class="d-flex flex-column" style="height: 100%; width:25%;">
        <v-card-title class="justify-center">
          Servers
        </v-card-title>
        <v-card style="height: 100%; width: 100%; overflow-y:auto">
          <div class="d-flex flex-column" style="height: 100%: overflow-y:hidden">
            <v-btn
              v-for="(guild, index) in guilds"
              :key="'g' + index"
              color="primary"
              style="margin-bottom: 5px"
              small
              @click="loadChannel(index);"
            >
              {{ guild.name }}
            </v-btn>
          </div>
        </v-card>
        <v-card-subtitle style="margin-top:auto" class="justify-center">
          Server not shown if you have insufficient privilege (admin or kick/ban people)
        </v-card-subtitle>
      </v-card>
      <v-card v-if="selectedGuild !== -1" style="height: 100%; border-left: 10px solid black" :width="guilds[selectedGuild].bot ? '25%' : '70%'">
        <v-card
          v-if="!guilds[selectedGuild].bot"
          class="d-flex flex-column"
          height="100%"
          width="100%"
        >
          <v-card-title class="justify-center" style="word-break: break-word;">
            Bot is not in this server.
          </v-card-title>
          <v-card class="d-flex justify-center">
            <v-btn
              color="primary"
              elevation="9"
              large
              href="https://discord.com/api/oauth2/authorize?client_id=826055534318583858&permissions=274877910016&scope=bot%20applications.commands"
            >
              Invite Bot
            </v-btn>
          </v-card>
        </v-card>
        <v-card
          v-else
          class="d-flex flex-column"
          height="100%"
          width="100%"
        >
          <v-card-title class="justify-center" style="word-break: break-word">
            {{ 'Channels (' + guilds[selectedGuild].name + ')' }}
          </v-card-title>
          <v-card style="height: 100%; width: 100%; overflow-y:auto">
            <div class="d-flex flex-column" style="height: 100%: overflow-y:hidden">
              <v-btn
                v-for="(channel, index) in channels"
                :key="'c' + index"
                color="primary"
                style="margin-bottom: 5px"
                small
                @click="loadSetting(index);"
              >
                {{ channel.name }}
              </v-btn>
            </div>
          </v-card>
        </v-card>
      </v-card>
      <v-card
        v-if="selectedChannel !== -1"
        class="d-flex flex-column"
        style="border-left: 10px solid black"
        width="50%"
      >
        <v-card-title class="justify-center" style="word-break: break-word">
          {{ 'Setting (' + channels[selectedChannel].name + ')' }}
        </v-card-title>
        <v-card-actions>
          <v-text-field v-model="channelInpt" label="Youtube Channel" />
        </v-card-actions>
        <v-card-actions>
          <v-select
            v-model="langInpt"
            :items="TL_LANGS"
            :item-text="item => item.text + ' (' + item.value + ')'"
            item-value="value"
            label="Lang"
            return-object
          />
          <v-btn
            icon
            lg
            @click="addSetting();"
          >
            <v-icon>
              {{ mdiPlusCircle }}
            </v-icon>
          </v-btn>
        </v-card-actions>
        <v-divider />
        <v-simple-table
          fixed-header
          style="max-height:33vh"
          width="auto"
        >
          <thead>
            <tr>
              <th class="text-left" style="width: 70%">
                Subscribed Channel
              </th>
              <th class="text-left" style="width: 25%">
                Lang
              </th>
              <th class="text-left" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(set, index) in setting" :key="'s' +index">
              <td>{{ set.link }}</td>
              <td>{{ set.lang }}</td>
              <td>
                <v-btn
                  icon
                  lg
                  @click="setting.splice(index, 1);"
                >
                  <v-icon>
                    {{ mdiMinusCircle }}
                  </v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
        <v-divider />
        <v-card class="d-flex justify-center">
          <v-card>
            <v-btn large color="primary" @click="saveSetting();">
              Save
            </v-btn>
            <v-card-subtitle>{{ saveNotif }}</v-card-subtitle>
          </v-card>
        </v-card>
      </v-card>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import backendApi from "@/utils/backend-api";
import { TL_LANGS } from "@/utils/consts";
import { mdiPlusCircle, mdiMinusCircle } from "@mdi/js";

export default {
    name: "RelayBotSetting",
    metaInfo() {
        return {
            get title() {
                return "RelayBot - Holodex";
            },
        };
    },
    data() {
        return {
            mdiPlusCircle,
            mdiMinusCircle,
            TL_LANGS,
            loggedIn: false,
            accessToken: "",
            guilds: [],
            channels: [],
            setting: [],
            channelInpt: "",
            langInpt: TL_LANGS[0],
            selectedGuild: -1,
            selectedChannel: -1,
            saveNotif: "",
        };
    },
    computed: {
        discordOAuth2Links() {
            // eslint-disable-next-line no-restricted-globals
            switch (location.hostname) {
                case "localhost": return ("https://discord.com/api/oauth2/authorize?client_id=826055534318583858&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Frelaybot&response_type=code&scope=guilds%20identify");
                case "staging.holodex.net": return ("https://discord.com/api/oauth2/authorize?client_id=826055534318583858&redirect_uri=https%3A%2F%2Fstaging.holodex.net%2Frelaybot&response_type=code&scope=guilds%20identify");
                case "holodex.net": return ("https://discord.com/api/oauth2/authorize?client_id=826055534318583858&redirect_uri=https%3A%2F%2Fholodex.net%2Frelaybot&response_type=code&scope=guilds%20identify");
                default: return ("");
            }
        },
    },
    watch: {
        // eslint-disable-next-line func-names
        "$route.query.code": function () {
            if ((this.$route.name === "relaybot") && this.$route.query.code) {
                this.init();
            }
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.loggedIn = false;
            if (!this.$route.query.code) {
                this.loggedIn = false;
                return;
            }

            let mode = 3;
            // eslint-disable-next-line no-restricted-globals
            switch (location.hostname) {
                case "localhost":
                    mode = 0;
                    break;
                case "staging.holodex.net":
                    mode = 1;
                    break;
                case "holodex.net":
                    mode = 2;
                    break;
                default:
                    mode = 3;
                    break;
            }

            backendApi.relayBotLogin(this.$route.query.code, mode).then(({ status, data }) => {
                if (status === 200) {
                    this.selectedChannel = -1;
                    this.selectedGuild = -1;
                    this.loggedIn = true;
                    this.accessToken = data.access_token;
                    this.guilds = data.guilds.filter((e) => e.admin).map((e) => ({
                        id: e.id,
                        name: e.name,
                        bot: false,
                    }));
                    this.checkGuild();
                }
            }).catch(() => {
                this.loggedIn = false;
            });
        },
        checkGuild() {
            backendApi.relayBotCheckBotPresence(this.guilds.map((e) => e.id)).then(({ status, data }) => {
                if (status === 200) {
                    this.guilds = this.guilds.map((e) => {
                        e.bot = data.includes(e.id);
                        return e;
                    });
                }
            }).catch(() => {
                this.loggedIn = false;
            });
        },
        loadChannel(index) {
            this.channels = [];
            this.selectedGuild = index;
            this.selectedChannel = -1;

            if (this.guilds[this.selectedGuild].bot) {
                backendApi.relayBotGetChannels(this.guilds[this.selectedGuild].id).then(({ status, data }) => {
                    if (status === 200) {
                        this.channels = data.map((e) => ({
                            id: e.id,
                            name: e.name,
                        }));
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        loadSetting(index) {
            this.selectedChannel = index;
            this.channelInpt = "";
            this.langInpt = {
                text: TL_LANGS[0].text,
                value: TL_LANGS[0].value,
            };
            this.saveNotif = "";
            this.setting = [];
            backendApi.relayBotGetSettingChannel(this.channels[this.selectedChannel].id).then(({ status, data }) => {
                if (status === 200) {
                    this.setting = data.SubChannel ? data.SubChannel.map((e) => {
                        if (!e.lang) { e.lang = "en"; }
                        return e;
                    }) : [];
                }
            }).catch((err) => {
                console.log(err);
            });
        },
        validateChannel(channelUrl) {
            if (channelUrl.indexOf("https://www.youtube.com/channel/") !== 0) {
                return undefined;
            }
            return (((channelUrl.indexOf("?") !== -1) ? channelUrl.slice(0, channelUrl.indexOf("?")) : channelUrl).slice(("https://www.youtube.com/channel/").length));
        },
        addSetting() {
            if (this.validateChannel(this.channelInpt)) {
                const setPush = {
                    link: `YT_${this.validateChannel(this.channelInpt)}`,
                    lang: this.langInpt.value,
                };
                if (this.setting.filter((e) => (e.link === setPush.link) && (e.lang === setPush.lang)).length === 0) {
                    this.setting.push(setPush);
                }
                this.channelInpt = "";
                this.langInpt = {
                    text: TL_LANGS[0].text,
                    value: TL_LANGS[0].value,
                };
            }
        },
        saveSetting() {
            this.saveNotif = "Saving...";
            backendApi.relayBotSubmitData(this.channels[this.selectedChannel].id, this.setting).then(({ status }) => {
                if (status === 200) {
                    this.saveNotif = "Saved!!";
                }
            }).catch((err) => {
                this.saveNotif = err;
            });
        },
    },
};
</script>

<style>
</style>
