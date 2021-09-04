// TODO: make eslint resolve this... somehow...
// eslint-disable-next-line
import { registerSW } from 'virtual:pwa-register'

let updateServiceWorkerFn = async (shouldReloadPage: boolean) => {};
let needsRefreshCallback = () => {};
let offlineReadyCallback = () => {};
let reg: ServiceWorkerRegistration | undefined;

const SW_UPDATE_INTERVAL = 60 * 60 * 1000;
function waitFor(type: string, target: EventTarget): Promise<Event> {
    return new Promise((resolve) => {
        target.addEventListener(type, (evt) => {
            resolve(evt);
        }, { once: true });
    });
}

if ("serviceWorker" in navigator) {
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
            // check for sw updates at 1 hour intervals
            newReg && setInterval(() => {
                newReg.update();
            }, SW_UPDATE_INTERVAL);
        },
        onRegisterError(err) {
            console.log("Error during service worker registration:", err);
        },
    });

    updateServiceWorkerFn = async (shouldReloadPage) => {
        if (reg && reg.waiting) {
            reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        await waitFor("controllerchange", navigator.serviceWorker);
        if (shouldReloadPage) window.location.reload();
    };
}

export const setNeedsRefreshCallback = (value: () => void) => {
    needsRefreshCallback = value;
};
export const setOfflineReadyCallback = (value: () => void) => {
    offlineReadyCallback = value;
};
export const getRegistration = () => reg;
export const updateServiceWorker = (shouldReloadPage = true) => updateServiceWorkerFn(shouldReloadPage);
