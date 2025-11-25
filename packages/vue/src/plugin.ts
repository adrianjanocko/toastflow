import type { App, Plugin } from "vue";
import { createToastStore, type ToastConfig } from "toastflow-core";
import { toastStoreKey } from "./symbols";
import { setToastStore } from "./toast";

export function createToastflow(config: Partial<ToastConfig> = {}): Plugin {
  const store = createToastStore(config);

  setToastStore(store);

  return {
    install(app: App) {
      app.provide(toastStoreKey, store);
    },
  };
}
