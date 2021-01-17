module.exports = {
    configureWebpack: {
        optimization: {
            chunkIds: "size",
            removeAvailableModules: true,
            occurrenceOrder: true,
            mangleWasmImports: true,
            splitChunks: {
                maxAsyncRequests: 4,
                maxInitialRequests: 4,
                enforceSizeThreshold: 200000,
                cacheGroups: {
                    // defaultVendors: {
                    //     test: /[\\/]node_modules[\\/]/,
                    //     priority: -10,
                    //     reuseExistingChunk: true
                    // },
                    default: {
                        name: "entry",
                        minChunks: 2,
                        priority: 50,
                        reuseExistingChunk: false,
                    },
                },
            },
        },
    },
    css: {
        extract: { ignoreOrder: true },
    },
    pages: {
        index: {
            entry: "src/main.js",
            title: "Holodex",
        },
    },
    pwa: {
        name: "Holodex",
        themeColor: "#42a5f5",
        msTileColor: "#42a5f5",
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "#42a5f5",
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
                    urlPattern: new RegExp("https://yt3.ggpht.com/a/(.*)=s40-c-k-c0x00ffffff-no-rj-mo(.*)"),
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
                    handler: "cacheFirst",
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
