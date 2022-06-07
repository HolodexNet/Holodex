// @flow

function hasWindow() {
    return typeof window !== "undefined";
}

export function addWindowEventListener(event: string, callback: () => void) {
    if (!hasWindow) {
        callback();
        return;
    }
    window.addEventListener(event, callback);
}

export function removeWindowEventListener(event: string, callback: () => void) {
    if (!hasWindow) {
        return;
    }
    window.removeEventListener(event, callback);
}
