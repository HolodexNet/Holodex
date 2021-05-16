export default {
    pulling(d, opts) {
        if (!opts.elControl) opts.elControl = opts.container.querySelector(".pull-to-refresh-material__control");

        const { threshold, elControl } = opts;

        let p = d / threshold;
        if (p > 1) p = 1;
        else p = p * p * p;
        const y = d / 2.5;

        elControl.style.opacity = p;
        elControl.style.transform = y ? `translate3d(-50%, ${y}px, 0) rotate(${360 * p}deg)` : "";
    },

    refreshing({ elControl, threshold }) {
        elControl.style.transition = "transform 0.2s";
        elControl.style.transform = `translate3d(-50%, ${threshold / 2.5}px, 0)`;
    },

    aborting({ elControl }) {
        return new Promise((resolve) => {
            if (elControl.style.transform) {
                elControl.style.transition = "transform 0.3s, opacity 0.15s";
                elControl.style.transform = "translate3d(-50%, 0, 0)";
                elControl.style.opacity = 0;
                elControl.addEventListener("transitionend", () => {
                    elControl.style.transition = "";
                    resolve();
                });
            } else {
                resolve();
            }
        });
    },

    restoring({ elControl }) {
        return new Promise((resolve) => {
            elControl.style.transition = "transform 0.3s";
            elControl.style.transform += " scale(0.01)";
            elControl.addEventListener("transitionend", () => {
                elControl.style.transition = "";
                resolve();
            });
        });
    },
};
