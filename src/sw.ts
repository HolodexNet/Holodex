let updateServiceWorkerFn = async (shouldReloadPage: boolean) => {};
let needsRefreshCallback = () => {};
let offlineReadyCallback = () => {};
let reg: ServiceWorkerRegistration | undefined;

function waitFor(type: string, target: EventTarget): Promise<Event> {
    return new Promise((resolve) => {
        target.addEventListener(type, (evt) => {
            resolve(evt);
        }, { once: true });
    });
}

// @ts-ignore TODO: env shims
if (import.meta.env.MODE === "prod") {
    // TODO: make eslint resolve this... somehow...
    import("virtual:pwa-register") // eslint-disable-line import/no-unresolved
        .then(({ registerSW }) => {
            registerSW({
                immediate: true,
                onNeedRefresh: () => {
                    needsRefreshCallback();
                },
                onOfflineReady() {
                    offlineReadyCallback();
                },
                onRegistered(newReg) {
                    reg = newReg;
                },
                onRegisterError(err) {
                    console.log("Error during service worker registration:", err);
                },
            });
        });
    if ("serviceWorker" in navigator) {
        updateServiceWorkerFn = async (shouldReloadPage) => {
            if (reg && reg.waiting) {
                reg.waiting.postMessage({ type: "SKIP_WAITING" });
            }
            await waitFor("controllerchange", navigator.serviceWorker);
            if (shouldReloadPage) window.location.reload();
        };
    }
}

export const setNeedsRefreshCallback = (value: () => void) => {
    needsRefreshCallback = value;
};
export const setOfflineReadyCallback = (value: () => void) => {
    offlineReadyCallback = value;
};
export const getRegistration = () => reg;
export const updateServiceWorker = (shouldReloadPage = true) => updateServiceWorkerFn(shouldReloadPage);
