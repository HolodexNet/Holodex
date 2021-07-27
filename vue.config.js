const API_BASE_URL = process.env.API_BASE_URL || "https://staging.holodex.net";
const REWRITE_API_PATH = !!process.env.REWRITE_API_PATH;

module.exports = {
    devServer: {
        proxy: {
            "/api": {
                target: API_BASE_URL,
                ...(REWRITE_API_PATH && { pathRewrite: { "^/api": "" } }),
                secure: false,
            },
            "/orgs.json": {
                target: `${API_BASE_URL}/orgs.json`,
                secure: false,
            },
        },
    },
    chainWebpack: (config) => {
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
        seo: {
            entry: "src/main.ts",
            title: "Holodex",
            template: "public/seo.html",
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
