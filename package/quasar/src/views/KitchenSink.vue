<template>
  <v-row>
    <v-col :cols="4">
      <kbd>Video Card</kbd>
      <div><video-card :video="video" include-channel include-avatar /></div>
      <div class="video-card">
        <video-thumbnail :video="placeholderVideo" />
      </div>
    </v-col>
  </v-row>
</template>

<script setup>
import VideoThumbnail from "@/components/video/card/VideoThumbnail.vue";
const video = {
  id: "rnVfwYuK8sw",
  title: "【ただいま!】復活の歌枠!!!おやすみありがとう!【大神ミオ/ホロライブ】",
  type: "stream",
  topic_id: "singing",
  published_at: "2022-06-19T15:51:06.000Z",
  available_at: "2022-06-19T14:17:44.000Z",
  duration: 4645,
  status: "past",
  songcount: 10,
  live_tl_count: {
    en: 7,
  },
  start_scheduled: "2022-06-19T14:15:00.000Z",
  start_actual: "2022-06-19T14:17:44.000Z",
  end_actual: "2022-06-19T15:46:48.000Z",
  live_viewers: 0,
  description:
    "一週間ちょっと、おやすみいただきました！\n\nサムネillustrator：THOMASさん\n\n🎤音源お借りします🎤\nカラオケ歌っちゃ王\nhttps://www.youtube.com/channel/UC1tk9F5-MGXEq4LWnjmrtpA\n生音風カラオケ屋\nhttps://www.youtube.com/channel/UCZ3ryrdsdqezi2q-AfRw6Rw\nHiroのピアノ伴奏アレンジ\nhttps://www.youtube.com/channel/UCWX2b3xIeJHoiNOPd9nTuKA\n¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨\n✨ホロライブ公式グッズこちら↓✨\nhttps://hololive.booth.pm/\nhttps://shop.hololivepro.com/\n\n🎶オリジナル楽曲『Howling』『わんわんわおーん』配信中です🎶\nhttps://mio.streamlink.to/howling\n\nMV動画も見てね👀✨\n『Howling』\nhttps://youtu.be/YPm9T622OX0\n\n『わんわんわおーん / さしみお feat.スバおか』\nhttps://youtu.be/cr9iLdXK9ik\n¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨\nホロライブ所属のバーチャル狼🐺\n大神ミオ（ookami mio）だよ🐺\nタロット占いとウクレレができます✨\n\nTwitterこちら➡ https://twitter.com/ookamimio\n予定とかつぶやいてるよ～！\n¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨\n🌲🐺メンバーシップ🐺🌲\nミオファの森はあったかい～✨\nよかったら入ってね💕まったりぬくぬくなコミュニティです🐺\n\n💛メンバーシップ限定スタンプが使えるヨ\n💛大神ミオの壁紙がDLできる！月１更新目指し中👍\n💛メンバーシップ限定動画が見られる！\n💛名前の横にメンバーバッチが付くよ🌟\n💛メンバーしか見られない生配信を月１以上でやってマス\n\n登録こちら➡ https://www.youtube.com/channel/UCp-5t9SrOQwXMU7iIjQfARg/join\n\n¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨\n◆ファンアート　#みおーん絵\n◆ファントーク/生放送タグ　#ミオかわいい\n◆ファンネーム　みおーんファミリー、ミオファ \n\n¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨¨\n制作\n-------------------------------------\nイラストレーター→泉彩パパ https://twitter.com/AC______\nLive2D制作→rariemonnさん https://twitter.com/rariemonn765\nロゴ制作→有馬トモユキさん　https://twitter.com/tatsdesign\n\n\n＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n\nホロライブ公式YouTubeチャンネルでもオリジナルコンテンツ配信中！▷ https://www.youtube.com/channel/UCJFZ...\nホロライブ公式Twitter▷ https://twitter.com/hololivetv\nホロライブ公式サイト▷ https://www.hololive.tv/\n\n＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝",
  clips: [
    {
      id: "-XLWg6yXU9M",
      lang: "en",
      type: "clip",
      title:
        "[ 19 Jun 2022 ] Mio Returns From Break But Forgets How To Livestream [ Eng Subs ]",
      status: "past",
      channel: {
        id: "UCCz-_ns0sn7fppx35HMznFw",
        name: "Major Arcana #310 Big God Mion",
        photo:
          "https://yt3.ggpht.com/36YQqKct1A6admfeAsR9bmTjQIUmE9hIC36r769hL_9wi45bRaQcDa7cVqjhuL_lqUxZ2zD68w=s800-c-k-c0x00ffffff-no-rj",
      },
      duration: 221,
      available_at: "2022-06-19T16:47:22+00:00",
    },
  ],
  refers: [
    {
      id: "cr9iLdXK9ik",
      lang: null,
      type: "stream",
      title: "わんわんわおーん / さしみお feat.スバおか",
      status: "past",
      channel: {
        id: "UCp-5t9SrOQwXMU7iIjQfARg",
        org: "Hololive",
        name: "Mio Channel 大神ミオ",
        photo:
          "https://yt3.ggpht.com/Z78RNXxUqpOGYKFt-VrJV7nlehOHzl7Ta-l1cgPx5Ewucmr5kY64iGxmPSe7QqIdM1ZhvPlEOg=s800-c-k-c0x00ffffff-no-rj",
        english_name: "Ookami Mio",
      },
      duration: 397,
      available_at: "2021-08-20T13:45:10+00:00",
    },
    {
      id: "YPm9T622OX0",
      lang: null,
      type: "stream",
      title: "【Original MV】Howling【ホロライブ/大神ミオ】",
      status: "past",
      channel: {
        id: "UCp-5t9SrOQwXMU7iIjQfARg",
        org: "Hololive",
        name: "Mio Channel 大神ミオ",
        photo:
          "https://yt3.ggpht.com/Z78RNXxUqpOGYKFt-VrJV7nlehOHzl7Ta-l1cgPx5Ewucmr5kY64iGxmPSe7QqIdM1ZhvPlEOg=s800-c-k-c0x00ffffff-no-rj",
        english_name: "Ookami Mio",
      },
      duration: 230,
      available_at: "2021-08-20T13:30:11+00:00",
    },
  ],
  songs: [
    {
      id: "4f568384-a2c8-4293-96a1-60f5d3e91cb9",
      art: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/f4/12/95/f412959e-6b72-6f1e-74a0-ad3652630368/source/100x100bb.jpg",
      end: 882,
      name: "まちがいさがし / Machigai Sagashi",
      start: 661,
      itunesid: 1536318304,
      original_artist: "菅田 将暉",
    },
    {
      id: "c402168b-d63a-4217-b8fd-130f859caa05",
      art: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/9a/ca/40/9aca4082-3aa6-1ba4-43b3-eb62ac48ef4a/source/100x100bb.jpg",
      end: 1566,
      name: "春よ、来い / Haru Yo, Koi",
      start: 1287,
      itunesid: 1436012884,
      original_artist: "松任谷由実",
    },
    {
      id: "8e71163f-6c1d-48c9-8365-2a3caa7ec18d",
      art: "https://is5-ssl.mzstatic.com/image/thumb/Music128/v4/a4/b3/63/a4b36367-13aa-6d68-c84f-c34fd19f9615/source/100x100bb.jpg",
      end: 2024,
      name: "最愛 / Saiai",
      start: 1692,
      itunesid: 1444886802,
      original_artist: "福山 雅治",
    },
    {
      id: "764a5751-3772-4479-aaf2-df24da068e85",
      art: "https://is2-ssl.mzstatic.com/image/thumb/Music115/v4/58/ee/27/58ee27af-06a5-dd5c-dfce-1d3d18f5fbb4/source/100x100bb.jpg",
      end: 3303,
      name: "Pale Blue",
      start: 3006,
      itunesid: 1568993237,
      original_artist: "米津玄師",
    },
    {
      id: "0a9bc6e7-2ce6-4efa-9817-81f6cc36b8d4",
      art: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/d5/35/a8/d535a8cd-6b2d-e27c-9395-a94f8e535fc1/source/100x100bb.jpg",
      end: 2870,
      name: "Jupiter",
      start: 2505,
      itunesid: 79140884,
      original_artist: "平原綾香",
    },
    {
      id: "46a22ea1-c771-4568-aca4-884db1eca947",
      art: "https://is2-ssl.mzstatic.com/image/thumb/Music124/v4/b4/e1/a0/b4e1a08c-0ed5-b09b-f7a1-94f45e04e034/source/100x100bb.jpg",
      end: 4559,
      name: "月のワルツ / Tsuki no Waltz",
      start: 4284,
      itunesid: 720409377,
      original_artist: "諫山実生",
    },
    {
      id: "61a58928-a538-40f2-9087-75ce95f70813",
      art: "https://is4-ssl.mzstatic.com/image/thumb/Music124/v4/89/f4/0f/89f40ff1-e5b5-3969-d5dd-ecf32f445466/source/100x100bb.jpg",
      end: 4119,
      name: "ダイアモンド クレバス / Diamond Crevasse",
      start: 3767,
      itunesid: 470484015,
      original_artist: "シェリル・ノーム starring May'n",
    },
    {
      id: "1787bd73-e8a6-4d6f-a9e2-25c0e9d98f45",
      art: "https://is3-ssl.mzstatic.com/image/thumb/Video4/v4/cf/a5/c3/cfa5c39b-d51c-dc81-3a73-9fc5a46a3f39/13UAEIM26332_1_17.jpg/100x100bb.jpg",
      end: 2389,
      name: "眩暈 / Memai",
      start: 2090,
      itunesid: 1445886202,
      original_artist: "鬼束ちひろ",
    },
    {
      id: "e2719d96-47b4-4bc8-b87d-70d0d506d6a9",
      art: "https://is4-ssl.mzstatic.com/image/thumb/Music/v4/94/ee/7d/94ee7d81-c21e-012d-e159-a4ae52d90519/source/100x100bb.jpg",
      end: 1224,
      name: "明日への手紙 / Asu e no Tegami",
      start: 934,
      itunesid: 896503389,
      original_artist: "手嶌葵",
    },
    {
      id: "b55b6e3d-ebbf-4ecf-831e-9fe5302cfc04",
      art: "https://is2-ssl.mzstatic.com/image/thumb/Music125/v4/58/22/d6/5822d645-9722-4697-2d08-ba02dadfbaa4/source/100x100bb.jpg",
      end: 3659,
      name: "ドライフラワー / Dry Flower",
      start: 3376,
      itunesid: 1534620183,
      original_artist: "優里",
    },
  ],
  channel: {
    id: "UCp-5t9SrOQwXMU7iIjQfARg",
    name: "Mio Channel 大神ミオ",
    org: "Hololive",
    type: "vtuber",
    photo:
      "https://yt3.ggpht.com/Z78RNXxUqpOGYKFt-VrJV7nlehOHzl7Ta-l1cgPx5Ewucmr5kY64iGxmPSe7QqIdM1ZhvPlEOg=s800-c-k-c0x00ffffff-no-rj",
    english_name: "Ookami Mio",
    view_count: "101635507",
    video_count: "526",
    subscriber_count: "1000000",
    clip_count: 5289,
  },
  comments: [
    {
      comment_key: "UgzN94OB3wvMzENqFlh4AaABAg",
      message:
        "2:22 Start\r\n6:31 食事会の話\r\n10:56 🎶Machigaisagashi / まちがいさがし\r\n15:30 🎶Asu e no Tegami / 明日への手紙\r\n21:26 🎶Haru Yo, Koi / 春よ、 来い\r\n27:53 🎶Saiai / 最愛\r\n34:45 🎶Memai / 眩暈\r\n41:33 🎶Jupiter\r\n50:03 🎶Pale Blue\r\n56:07 🎶Dried Flower / ドライフラワー\r\n1:02:43 🎶Diamond Crevasse / ダイアモンドクレバス\r\n1:11:19 🎶Tsuki No Waltz / 月のワルツ\r\n1:16:00 Ending",
    },
  ],
};

const placeholderVideo = {
  id: "AfMx8rx1nKf",
  title: "Collab",
  type: "placeholder",
  available_at: "2022-06-22T12:00:00.000Z",
  duration: 3600,
  status: "upcoming",
  start_scheduled: "2022-06-22T12:00:00.000Z",
  channel: {
    id: "UC6eWCld0KwmyHFbAqK3V-Rw",
    name: "Koyori ch. 博衣こより - holoX -",
    org: "Hololive",
    type: "vtuber",
    photo:
      "https://yt3.ggpht.com/WO7ItKNmy6tW_NQ82g8c1y74CZSw6GsSdynsE5s2csuEok2fHRrAaGcBV3JJO-2BxEOXXA8lvw=s800-c-k-c0x00ffffff-no-rj",
    english_name: "Hakui Koyori",
  },
  jp_name: "コラボ予定",
  link: "https://twitter.com/hakuikoyori/status/1538698683482394626",
  thumbnail: "https://i.ytimg.com/vi/A81NFOBNvuM/maxresdefault.jpg",
  placeholderType: "scheduled-yt-stream",
  certainty: "certain",
  credits: {
    editor: {
      name: "Nemu#2378",
      user: "8285",
    },
  },
};
</script>
