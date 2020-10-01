module.exports = {
    pwa: {
        name: "Holodex",
        themeColor: "#64B5F6",
        msTileColor: "#64B5F6",
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "#64B5F6",
        workboxOptions: {
            runtimeCaching: [
                {
                    urlPattern: new RegExp(
                        "https://fonts.(?:googleapis|gstatic).com/(.*)"
                    ),
                    handler: "cacheFirst",
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
                    urlPattern: new RegExp(
                        "https://yt3.ggpht.com/a/(.*)=s40-c-k-c0x00ffffff-no-rj-mo(.*)"
                    ),
                    handler: "cacheFirst",
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
            ],
        },
    },
};
