// TODO: make eslint resolve this... somehow...
// eslint-disable-next-line
import { registerSW } from "virtual:pwa-register";

let updateServiceWorkerFn = () => {};
let needsRefreshCallback = () => {};
let offlineReadyCallback = () => {};
let controllerChangeCallback = () => {};
// eslint-disable-next-line
let reg: ServiceWorkerRegistration | undefined;

const SW_UPDATE_INTERVAL = 15 * 60 * 1000;

if ("serviceWorker" in navigator) {
  updateServiceWorkerFn = () => {
    if (reg && reg.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };
  registerSW({
    immediate: true,
    onNeedRefresh: () => {
      needsRefreshCallback();
      // Temporary auto update
      updateServiceWorkerFn();
    },
    onOfflineReady() {
      offlineReadyCallback();
    },
    onRegistered(newReg) {
      reg = newReg;
      // check for sw updates at 1 hour intervals
      newReg
        && setInterval(() => {
          newReg.update();
        }, SW_UPDATE_INTERVAL);
    },
    onRegisterError(err) {
      console.log("Error during service worker registration:", err);
    },
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    controllerChangeCallback();
    // window.location.reload();
  });
}

export const setNeedsRefreshCallback = (value: () => void) => {
  needsRefreshCallback = value;
};
export const setOfflineReadyCallback = (value: () => void) => {
  offlineReadyCallback = value;
};
export const setControllerChangeCallback = (value: () => void) => {
  controllerChangeCallback = value;
};
export const getRegistration = () => reg;
export const updateServiceWorker = () => updateServiceWorkerFn();
