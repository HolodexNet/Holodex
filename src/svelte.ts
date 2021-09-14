/* eslint-disable */
// @ts-nocheck

import("smelte/src/tailwind.css");
import("@livetl/ui-components/components/Lite.svelte").then((component) => {
    new component.default({
        target: document.body,
        props: {
        },
    });
});
