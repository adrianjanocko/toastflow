import type { InjectionKey } from "vue";
import type { ToastStore } from "toastflow-core";

export const toastStoreKey: InjectionKey<ToastStore> = Symbol.for(
  "vue-toastflow.toast-store",
);
