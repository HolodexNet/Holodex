import WatchInfo from "@/components/watch/WatchInfo";

export default {
    title: "Watch/WatchInfo",
    component: WatchInfo,
    argTypes: {
        // backgroundColor: {
        //     control: "color",
        // },
        // size: {
        //     control: {
        //         type: "select",
        //         options: ["small", "medium", "large"],
        //     },
        // },
        video: { control: "object" },
    },
};

const Template = (args, { loaded: { video } }) => {
    console.log(video);

    return {
        props: { video },
        components: {
            WatchInfo,
        },
        template: '<div><watch-info v-if="video" :video="video" /></div>',
    };
};

export const Primary = Template.bind({});
Primary.args = {
    video: {
        id: "sRVpQ-zTcrc",
        title: "Reddit Shitpost Review with Polka!",
        type: "stream",
        published_at: "2021-01-23T17:52:17.000Z",
        available_at: "2021-01-24T03:00:17.424Z",
        duration: 3806,
        status: "past",
        start_scheduled: "2021-01-24T03:00:00.000Z",
        start_actual: "2021-01-24T03:00:17.424Z",
        end_actual: "2021-01-24T04:03:44.000Z",
        description:
            'Dear fellow reddit users: POL!!!\n#redditshitreview\n\n自称"インターネットの入り口"海外の巨大コミュニティサイトreddit...\nここにホロライブの公式が運営しているページが存在している…\nだからといって海外ニキ達のクソ投稿は止まらない！\nホロ海外ファンのクソユーモアにより毎日おもちゃにされるホロメン！？日本の皆さんも加勢してとんでもないことに・・・！\n今日はポルカ氏と！\nPolka Ch.\nhttps://www.youtube.com/channel/UCK9V2B22uJYu3N7eR_BT9QA\n\nホロライブ公式reddit(海外コミュニティサイト)\nhttps://www.reddit.com/r/Hololive/\n\nみんな大好きTiermakerでmemeをつくろう！：https://twitter.com/tiermaker\n☆Memberships to support Coco☆\nhttps://www.youtube.com/channel/UCS9uQI-jC3DE0L4IpXyvr6w/join\n\n■桐生ココグッズ販売中！Coco merch!\n[桐生会]代紋バッチ　https://hololive.booth.pm/items/2659845\nクソザコT　https://hololive.booth.pm/items/1796466\nあさココT　https://hololive.booth.pm/items/2186749\nガチコイT　https://hololive.booth.pm/items/2213532\n\nホロライブ所属、2019.12.28デビューしました！4期生で4代目会長の桐生ココ（Coco Kiryu）です。\n\nmy twitter  \n▼https://twitter.com/kiryucoco\n\nHey this is Coco Kiryu from hololive crew from Japan!\nWaiting for your follow / likes / subscribe♡ / \n---------------------------------------------------------------------------------\n▽配信内のMOVIEに使用させていただきました💓[credit]\nOP MUSIC https://www.youtube.com/watch?v=vHOmLRcCVQ0 REDALiCE様\nEND MUSIC https://twitter.com/2ncooh 様\nイラスト https://twitter.com/sobasobaHNSK 様\nまつのこgif https://twitter.com/migizzz2 様\nあさココgif https://twitter.com/haohaoniihao 様\nロゴ、配信画面 https://twitter.com/na_gosan 様\n\n▼歌配信でご協力いただいています\nカラオケ歌っちゃ王様　https://www.youtube.com/channel/UC1tk9F5-MGXEq4LWnjmrtpA\nろくろ様　https://twitter.com/_akuorc\n\n▼限定ボイス・グッズ(Voices/Goodies/Merch)\nhttps://hololive.booth.pm/\n\n▽ホロジュール（hololive member\'s Streaming Schedule）\nhttps://schedule.hololive.tv/\nhttps://hololive.jetri.co/\n\n▼プレゼント・お手紙の送付先(Sending me gifts?)\n〒173-0003\n東京都板橋区加賀1丁目6番1号\nネットデポ新板橋\nカバー株式会社　\nプレゼント係分　桐生ココ宛\n\nhttps://www.hololive.tv/contact\n---------------------------------------------------------------------------------\n\n*Check out our family*\n▼ホロライブプロダクション公式サイト\nhttps://www.hololive.tv/\n▼ホロライブプロダクション公式Twitter\nhttps://twitter.com/hololivetv\n▼ホロライブ公式チャンネル\nhttps://www.youtube.com/channel/UCJFZiqLMntJufDCHc6bQixg\n---------------------------------------------------------------------------------\n【　所属会社からのお知らせ　】\n現在弊社タレントに対し、配信中のチャット等によりセンシティブな発言を誘発して、炎上を引き起こそうとする事象が散見されています。\nこれに対し、NGワードを設定して予防を行っておりますが、当該対応は政治的意図を含むものではなく、タレントの安全な配信を担保するためである旨ご理解ください。\n\n上記のとおり、炎上を故意に誘発しようとするユーザーによるチャットやコメントによって、タレントが意図せずセンシティブな発言を行ってしまう可能性があります。\nこのような発言を行った場合にも、タレントには政治的・社会的意図は無いことを予めご理解ください。\n\nNotices From COVER Corporation\n\nWe have been made aware of a number of attempts to incite controversy against our talents by causing them to utter sensitive statements using the live stream chat.\n\nIn response to this, we have set up a list of terms unable to be mentioned at present to prevent this. Please understand that this response is not politically motivated and is intended to ensure the peaceful live streams by our talents.\n\nPlease understand that even if such statements were to be said by the talents, these are in no way politically or ideologically motivated.\n#桐生ココ\n#hololive',
        clips: [
            {
                id: "nUqjBoqXnvM",
                lang: "zh",
                type: "clip",
                title: "【hololive】波爾卡與可可的梗圖回顧，日本兄貴參戰!【桐生可可/尾丸波爾卡】【vtuber 中文】",
                status: "past",
                channel: {
                    id: "UC2O_MEf6NEVX-0RZfVpji2g",
                    name: "Hololive Vtuber 中譯與精華",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwnj8XjxHXxtRkWFPXTbVYnj-1WaU04UgyeMu0mwo=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 112,
                available_at: "2021-01-24T04:55:27",
            },
            {
                id: "3wDam9QXQVg",
                lang: "ja",
                type: "clip",
                title: "ホロメンパパママたちの娘への扱い方に癖があるreddit【ホロライブ切り抜き】",
                status: "past",
                channel: {
                    id: "UChIike17DgPwubWZUvhBirQ",
                    name: "かげちゃん【切り抜き】",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwniuZAyg7cS1lZfnejn4C97WGb0fLXziBwMzgV1_tQ=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 177,
                available_at: "2021-01-24T04:46:47",
            },
            {
                id: "N_t62HTfhuc",
                lang: "en",
                type: "clip",
                title: '【Hololive】Polka Said "Motherf*cker" ft. Coco【Reddit Meme Review】【Eng Sub】',
                status: "past",
                channel: {
                    id: "UCF4-I8ZQL6Aa-iHfdz-B9KQ",
                    name: "OtakMori Translations - VTubers",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwni60p1KquNb691-Z3chvKqP3GKCh7cz3EjOC7oX=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 113,
                available_at: "2021-01-24T05:06:47",
            },
            {
                id: "oOMje7MTyxg",
                lang: "en",
                type: "clip",
                title: "LIVE TL Difficulty : IMPOSSIBLE 【HOLOLIVE】【ENG SUB】",
                status: "past",
                channel: {
                    id: "UCMxS6nVWZR18_gHZq8nVkHw",
                    name: "V Clip n' Subs",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwnjc81EKNKuINgz9V_2ULkpGWJjFUBajTKvLX2bM=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 239,
                available_at: "2021-01-24T05:27:19",
            },
            {
                id: "cDjptmlDkCY",
                lang: "zh",
                type: "clip",
                title: "【vtuber中翻精華】可可看外國迷因 week 20【桐生可可+尾丸波爾卡】",
                status: "past",
                channel: {
                    id: "UCPdeyZAMwzSWM0hEAsiknug",
                    name: "野生的全熟肉G / 野生のこんがり肉G",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwnj9maSb7bnV-wQy19HUVis_IyJeH_tdRPg-LO6X=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 319,
                available_at: "2021-01-24T05:22:59",
            },
            {
                id: "lziSOiaOk8s",
                lang: "en",
                type: "clip",
                title:
                    "【ENG Sub】Kiryu Coco - Polka look at Kiara, Subaru and Reine and their Mama's on Reddit Meme Review",
                status: "past",
                channel: {
                    id: "UCg02KL1G0nmH0QzFuLsVoRQ",
                    name: "Vtube Tengoku",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwngYWz9gR0rUrLYa4BM0zA5JwjMW1kUxMFNzSMWA=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 183,
                available_at: "2021-01-24T05:35:03",
            },
            {
                id: "sz9LELG2xRM",
                lang: "ja",
                type: "clip",
                title: "桐生ココの遅刻を煽ってしまう尾丸ポルカ【ホロライブ切り抜き】",
                status: "past",
                channel: {
                    id: "UCLVQAHfmh0KRIXv3oCAeiHA",
                    name: "ホロライブ速報",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwnhMUON7tyHpnSRMZnfjK6t2AcQpnchG2Z7I9_Qz=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 67,
                available_at: "2021-01-24T05:08:58",
            },
            {
                id: "NPjuOr_wP_E",
                lang: "en",
                type: "clip",
                title: "【Reddit Meme Review】Describe Hololive girls in one word [Coco, Polka][EngSub]",
                status: "past",
                channel: {
                    id: "UCc3ckj0RzRXzJjz6Gi02kBg",
                    name: "nendoro translate",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwnjTFmyRVwtXgmE2NxDuHS0fpCiFg7KYNNGjqZc=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 737,
                available_at: "2021-01-25T05:18:39",
            },
            {
                id: "fjc04M2vuxU",
                lang: "en",
                type: "clip",
                title: "【Hololive】Polka: Don't Touch Me!!! ft. Coco【Reddit Meme Review】【Eng Sub】",
                status: "past",
                channel: {
                    id: "UCF4-I8ZQL6Aa-iHfdz-B9KQ",
                    name: "OtakMori Translations - VTubers",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwni60p1KquNb691-Z3chvKqP3GKCh7cz3EjOC7oX=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 76,
                available_at: "2021-01-24T06:48:43",
            },
            {
                id: "ss4qccfE7w8",
                lang: "zh",
                type: "clip",
                title: "【vtuber中文】最终在会长的引领下，座长还是说出了禁忌的词汇【Coco/Polka】【hololive】",
                status: "past",
                channel: {
                    id: "UCfw7uixZ0WcHJcdLXRdNUFg",
                    name: "ArcadeGrey",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwnikvhnR_PXIfeDK5q1EdU2m8fU3qJkzxSXh21q4=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 106,
                available_at: "2021-01-24T06:02:00",
            },
            {
                id: "UfzM7sJhaQs",
                lang: "en",
                type: "clip",
                title: "【Hololive】Polka Learned That Watame is a Hentai ft. Coco【Reddit Meme Review】【Eng Sub】",
                status: "past",
                channel: {
                    id: "UCF4-I8ZQL6Aa-iHfdz-B9KQ",
                    name: "OtakMori Translations - VTubers",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwni60p1KquNb691-Z3chvKqP3GKCh7cz3EjOC7oX=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 80,
                available_at: "2021-01-24T04:32:02",
            },
            {
                id: "SFLbnssmMEM",
                lang: "en",
                type: "clip",
                title: "Polka & Coco's MotherFaqing Meme Review (Hololive) [ENG SUB]",
                status: "past",
                channel: {
                    id: "UCyzMryVenFbaKzbjN-dy-6w",
                    name: "-Double Negative-",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwngnTbFrA6WoxV71uxMMf0YKrSFWllzu_P4cao35=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 478,
                available_at: "2021-01-24T20:23:18",
            },
            {
                id: "TnUOEurXVPk",
                lang: "zh",
                type: "clip",
                title:
                    "【尾丸ポルカ/桐生ココ 】用一個字去形容hologirls吧！ Reddit Shitpost Review with Polka! Part:3【尾丸座中文翻譯】",
                status: "past",
                channel: {
                    id: "UCYyDbAJN6bZ-gLL04V3h6_w",
                    name: "尾丸座の屋根裏",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwniXji1Ccwl1A74au7DN6ghft4aVSwbeKYK8UkQg=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 739,
                available_at: "2021-01-24T14:27:13",
            },
            {
                id: "IeCpmIAYIyQ",
                lang: "en",
                type: "clip",
                title: 'Overseas people know how versatile "Kusa" is【Hololive/Eng sub】【Kiryuu Coco/Omaru Polka】',
                status: "past",
                channel: {
                    id: "UC4Fh9OcvIEWK405Cvg25jDw",
                    name: "Sushi [Hololive and Vtubers]",
                    photo:
                        "https://yt3.ggpht.com/ytc/AAUvwnjgwZh6IPRoqY8D7CQf-T-W5b6LBmofbf9c5_OL=s800-c-k-c0x00ffffff-no-rj",
                },
                duration: 64,
                available_at: "2021-01-24T15:00:03",
            },
        ],
        mentions: [
            {
                id: "UCJFZiqLMntJufDCHc6bQixg",
                org: "Hololive",
                lang: null,
                name: "hololive ホロライブ - VTuber Group",
                type: "vtuber",
                photo:
                    "https://yt3.ggpht.com/ytc/AAUvwngST9tdspZgipxxe6KUzq_t-CkbVhCjkmnWxb1uZw=s800-c-k-c0x00ffffff-no-rj",
                english_name: "Hololive VTuber Group",
            },
            {
                id: "UCK9V2B22uJYu3N7eR_BT9QA",
                org: "Hololive",
                lang: null,
                name: "Polka Ch. 尾丸ポルカ",
                type: "vtuber",
                photo:
                    "https://yt3.ggpht.com/ytc/AAUvwnh-sak3t15svmMDNF8w_uxnNEChOL7C1DKAO-Ht=s800-c-k-c0x00ffffff-no-rj",
                english_name: "Omaru Polka",
            },
        ],
        channel: {
            id: "UCS9uQI-jC3DE0L4IpXyvr6w",
            name: "Coco Ch. 桐生ココ",
            type: "vtuber",
            photo: "https://yt3.ggpht.com/ytc/AAUvwniPku-5QatVce_BIjIeBxT5rj9lrTlCpXCvEWa7=s800-c-k-c0x00ffffff-no-rj",
            english_name: "Kiryu Coco",
            view_count: "101108109",
            video_count: "585",
            subscriber_count: "955000",
            clip_count: 1688,
        },
    },
};
