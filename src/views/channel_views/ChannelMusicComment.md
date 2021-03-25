    <!-- Historical song-item list usage <v-card elevation="5">
                <v-card-subtitle>
                    Most recent songs ({{ recentOffset + 1 }} - {{ recentOffset + recentLimit }})
                </v-card-subtitle>
                <v-list>
                    <v-divider></v-divider>
                    <song-item
                        v-for="(song, idx) in recentSongs"
                        :song="song"
                        :key="'clist' + song.name + song.video_id + idx"
                        @play="$store.commit('music/addSong', song)"
                        @playNow="skipToSong"
                        showTime
                        :hoverIcon="icons.mdiPlaylistMusic"
                        :artworkHoverIcon="icons.mdiPlay"
                    ></song-item>
                    <v-divider></v-divider>
                    <v-list-item class="d-flex">
                        <v-btn class="flex-grow-1" @click="recentOffset = Math.max(0, recentOffset - recentLimit)"
                            >Newer</v-btn
                        >
                        <v-btn class="flex-grow-1" @click="recentOffset += recentLimit">Older</v-btn>
                    </v-list-item>
                </v-list>
            </v-card> -->
Just some usage dumping