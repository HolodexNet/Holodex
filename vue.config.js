module.exports = {
    chainWebpack: (config) => {
        // if (process.env.STORYBOOK && process.env.STORYBOOK.trim() === "true") {
        //     console.info("info => Updating webpack using chain-webpack");
        //     // eslint-disable-next-line no-param-reassign
        //     config.module
        //         .rule("addon-storysource")
        //         .enforce()
        //         .pre()
        //         .test(/\.stories\.jsx?$/)
        //         .use("@storybook/addon-storysource/loader")
        //         .loader("@storybook/addon-storysource/loader")
        //         .options({
        //             semi: false,
        //             printWidth: 120,
        //             singleQuote: true,
        //         })
        //         .end();
        // }
        return config;
    },
    css: {
        extract: process.env.NODE_ENV !== "production" ? undefined : { ignoreOrder: true },
    },
    pages: {
        index: {
            entry: "src/main.ts",
            title: "Holodex",
        },
    },
    pwa: {
        name: "Holodex",
        themeColor: "#42a5f5",
        msTileColor: "#42a5f5",
        appleMobileWebAppCapable: "yes",
        manifestOptions: {
            display: "standalone",
            backgroundColor: "#215183",
        },
        appleMobileWebAppStatusBarStyle: "black-translucent",
        scope: "/",
        start_url: "/?utm_source=homescreen",
        workboxOptions: {
            runtimeCaching: [
                {
                    urlPattern: new RegExp("https://fonts.(?:googleapis|gstatic).com/(.*)"),
                    handler: "CacheFirst",
                    options: {
                        cacheName: "google-fonts",
                        expiration: {
                            maxEntries: 30,
                        },
                        cacheableResponse: {
                            statuses: [0, 200],
                        },
                    },
                },
                {
                    urlPattern: new RegExp("https://yt3.ggpht.com/(a/|ytc/)(.*)=s(40|88)-c-k-c0x00ffffff-no-rj-mo(.*)"),
                    handler: "CacheFirst",
                    options: {
                        cacheName: "channel-photo",
                        expiration: {
                            maxAgeSeconds: 86400,
                            purgeOnQuotaError: true,
                        },
                        cacheableResponse: {
                            statuses: [0, 200],
                        },
                    },
                },
                {
                    urlPattern: new RegExp("https://www.youtube.com/player_api"),
                    handler: "CacheFirst",
                    options: {
                        cacheName: "youtube-player",
                        expiration: {
                            maxAgeSeconds: 10800,
                            maxEntries: 1,
                        },
                        cacheableResponse: {
                            statuses: [0, 200],
                        },
                    },
                },
            ],
        },
    },
};
