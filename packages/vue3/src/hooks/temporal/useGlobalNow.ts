import { createSharedComposable, useNow } from "@vueuse/core";

export const useSharedNow = createSharedComposable(useNow);
