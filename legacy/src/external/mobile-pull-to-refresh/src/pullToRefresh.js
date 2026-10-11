import ontouchpan from "./ontouchpan";

export default function (opts) {
    opts = Object.assign(
        {
            // https://bugs.chromium.org/p/chromium/issues/detail?id=766938
            scrollable: document.body,
            threshold: 150,
            onStateChange() {
                /* noop */
            },
            shouldPullToRefresh: () => true,
        },
        opts,
    );

    const { container, scrollable, threshold, refresh, onStateChange, animates, shouldPullToRefresh } = opts;

    let distance, offset, state; // state: pulling, aborting, reached, refreshing, restoring

    function addClass(cls) {
        container.classList.add("pull-to-refresh--" + cls);
    }

    function removeClass(cls) {
        container.classList.remove("pull-to-refresh--" + cls);
    }

    function scrollTop() {
        if (!scrollable || [window, document, document.body, document.documentElement].includes(scrollable)) {
            return document.documentElement.scrollTop || document.body.scrollTop;
        } else {
            return scrollable.scrollTop;
        }
    }

    return ontouchpan({
        element: container,
        onpanmove(e) {
            let d = e.deltaY;

            if (scrollTop() > 0 && state === "reached") {
                removeClass(state);
                state = "pulling";
                addClass(state);
                onStateChange(state, opts);
            }

            if (
                !shouldPullToRefresh() ||
                scrollTop() > 0 ||
                (d < 0 && !state) ||
                state in { aborting: 1, refreshing: 1, restoring: 1 }
            )
                return;

            if (e.cancelable) {
                e.preventDefault();
            }

            if (distance == null) {
                offset = d;
                state = "pulling";
                addClass(state);
                onStateChange(state, opts);
            }

            d = d - offset;
            if (d < 0) d = 0;
            distance = d;

            if ((d >= threshold && state !== "reached") || (d < threshold && state !== "pulling")) {
                removeClass(state);
                state = state === "reached" ? "pulling" : "reached";
                addClass(state);
                onStateChange(state, opts);
            }

            animates.pulling(d, opts);
        },

        onpanend() {
            if (state == null) return;

            if (state === "pulling") {
                removeClass(state);
                state = "aborting";
                onStateChange(state);
                addClass(state);
                animates.aborting(opts).then(() => {
                    removeClass(state);
                    distance = state = offset = null;
                    onStateChange(state);
                });
            } else if (state === "reached") {
                removeClass(state);
                state = "refreshing";
                addClass(state);
                onStateChange(state, opts);
                animates.refreshing(opts);

                refresh().then(() => {
                    removeClass(state);
                    state = "restoring";
                    addClass(state);
                    onStateChange(state);

                    animates.restoring(opts).then(() => {
                        removeClass(state);
                        distance = state = offset = null;
                        onStateChange(state);
                    });
                });
            }
        },
    });
}
