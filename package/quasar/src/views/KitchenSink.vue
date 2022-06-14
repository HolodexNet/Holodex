<template>
  <v-row>
    <v-col :cols="2">
      <kbd>Video Card</kbd>
      <div><video-card :video="video" /></div>
    </v-col>
  </v-row>
</template>

<script setup>


const video = {
    "id": "k8UuJxhGQf8",
    "title": "【Golf It!】誰が一番のゴルファーか決めようか⛳【ホロライブ/夏色まつり】",
    "type": "stream",
    "topic_id": "Golf_It!",
    "published_at": "2022-06-13T05:12:30.000Z",
    "available_at": "2022-06-14T14:00:00.000Z",
    "duration": 0,
    "status": "upcoming",
    "start_scheduled": "2022-06-14T14:00:00.000Z",
    "live_viewers": 0,
    "mentions": [
        {
            "id": "UC5CwaMl1eIgY8h02uZw7u8A",
            "org": "Hololive",
            "lang": null,
            "name": "Suisei Channel",
            "type": "vtuber",
            "photo": "https://yt3.ggpht.com/ytc/AKedOLT7D-JlLZGTq6Y95nLxeXG2B-7WMGpFXZ7Qa4iY5w=s800-c-k-c0x00ffffff-no-rj-mo",
            "english_name": "Hoshimachi Suisei"
        },
        {
            "id": "UC6eWCld0KwmyHFbAqK3V-Rw",
            "org": "Hololive",
            "lang": null,
            "name": "Koyori ch. 博衣こより - holoX -",
            "type": "vtuber",
            "photo": "https://yt3.ggpht.com/WO7ItKNmy6tW_NQ82g8c1y74CZSw6GsSdynsE5s2csuEok2fHRrAaGcBV3JJO-2BxEOXXA8lvw=s800-c-k-c0x00ffffff-no-rj",
            "english_name": "Hakui Koyori"
        },
        {
            "id": "UC1uv2Oq6kNxgATlCiez59hw",
            "org": "Hololive",
            "lang": null,
            "name": "Towa Ch. 常闇トワ",
            "type": "vtuber",
            "photo": "https://yt3.ggpht.com/meRnxbRUm5yPSwq8Q5QpI5maFApm5QTGQV_LGblQFsoO0yAV4LI-nSZ70GYwMZ_tbfSa_O8MTCU=s800-c-k-c0x00ffffff-no-rj",
            "english_name": "Tokoyami Towa"
        }
    ],
    "channel": {
        "id": "UCQ0UDLQCjY0rmuxCDE38FGg",
        "name": "Matsuri Channel 夏色まつり",
        "org": "Hololive",
        "type": "vtuber",
        "photo": "https://yt3.ggpht.com/wIqM7MWDN94PoibzPmeog7WOt8jFKTKZBOBFEbLBaiUAdKLwoqdLC_CN7B7Gby-FWH-076rN=s800-c-k-c0x00ffffff-no-rj",
        "english_name": "Natsuiro Matsuri"
    }
	
}
</script>