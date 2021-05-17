const animates = {
    pulling(d, opts) {
        if (!opts.elSpinner) {
            opts.elMain = opts.container.querySelector(".pull-to-refresh-ios__main");
            opts.elSpinner = opts.container.querySelector(".pull-to-refresh-ios__spinner");
        }

        const { threshold, elMain, elSpinner } = opts;

        let p = d / threshold;
        if (p > 1) p = 1;
        else p = p * p * p;

        const spinnerCls = Math.floor(p * 12);
        if (opts.spinnerCls !== spinnerCls) {
            if (opts.spinnerCls) elSpinner.classList.remove("pull-to-refresh-ios__spinner--s" + opts.spinnerCls);
            if (spinnerCls) elSpinner.classList.add("pull-to-refresh-ios__spinner--s" + spinnerCls);
            opts.spinnerCls = spinnerCls;
        }

        const y = d / 2.5;
        elMain.style.transform = y ? `translate3d(0, ${y}px, 0)` : "";
    },

    refreshing({ elMain, threshold }) {
        elMain.style.transition = "transform 0.2s";
        elMain.style.transform = `translate3d(0, ${threshold / 2.5}px, 0)`;
    },

    aborting(opts) {
        return new Promise((resolve) => {
            const { elMain, elSpinner } = opts;

            let n = opts.spinnerCls;
            opts.spinnerCls = null;
            if (n) {
                const timer = setInterval(() => {
                    elSpinner.classList.remove("pull-to-refresh-ios__spinner--s" + n);
                    if (--n === 0) clearInterval(timer);
                    else elSpinner.classList.add("pull-to-refresh-ios__spinner--s" + n);
                }, 300 / n);
            }

            if (elMain.style.transform) {
                elMain.style.transition = "transform 0.3s";
                elMain.style.transform = "translate3d(0, 0, 0)";
                elMain.addEventListener("transitionend", () => {
                    elMain.style.transition = "";
                    resolve();
                });
            } else {
                resolve();
            }
        });
    },

    restoring(opts) {
        return new Promise((resolve) => {
            const { elMain, elSpinner, spinnerCls } = opts;
            if (spinnerCls) elSpinner.classList.remove("pull-to-refresh-ios__spinner--s" + spinnerCls);
            opts.spinnerCls = null;
            elMain.style.transition = "transform 0.3s";
            elMain.style.transform = "translate3d(0, 0, 0)";
            elMain.addEventListener("transitionend", () => {
                elMain.style.transition = "";
                resolve();
            });
        });
    },
};

export default animates;
