module.exports = {
    pwa: {
        name: "Holodex",
        themeColor: "#4DBA87",
        msTileColor: "#000000",
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "black",

        // // configure the workbox plugin
        // workboxPluginMode: "InjectManifest",
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
            ],
        },
    },
};
