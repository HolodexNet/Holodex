import { createPinia } from "pinia";
import { createPersistedStatePlugin } from "pinia-plugin-persistedstate-2";
import { PiniaSharedState } from "pinia-shared-state";

export function setupPinia() {
  const pinia = createPinia();

  // persisted state:
  const pspinstall = createPersistedStatePlugin({
    persist: false,
    // serialize: (value) => stringify(value), (use if circular reference needs a safe serializer)
  });
  pinia.use((context) => pspinstall(context));

  // @Todo shared state is getting a bit too big. Maybe suck the file in it's just 1 file.
  // https://github.com/wobsoriano/pinia-shared-state/blob/master/src/index.ts
  // the reason its big is due to realistic-structured-clone + broadcast-channel polyfill.

  // shared state:
  pinia.use(
    PiniaSharedState({
      // Enables the plugin for all stores. Defaults to true.
      enable: false,
      // If set to true this tab tries to immediately recover the shared state from another tab. Defaults to true.
      initialize: false,
    }),
  );

  return pinia;
}
