import {
  ToastConfig,
  ToastEvent,
  ToastId,
  ToastOptions,
  ToastState,
  ToastStore,
} from "toastflow-core";

let globalStore: ToastStore | null = null;

export function setToastStore(store: ToastStore) {
  globalStore = store;
}

export function getToastStore(): ToastStore {
  if (!globalStore) {
    throw new Error(
      "[vue-toastflow] Toast store not initialized. Did you install the plugin?",
    );
  }
  return globalStore;
}

export const toast = {
  getState(): ToastState {
    return getToastStore().getState();
  },
  subscribeEvents(listener: (event: ToastEvent) => void): () => void {
    return getToastStore().subscribeEvents(listener);
  },
  show(options: Partial<ToastOptions>): ToastId {
    return getToastStore().show(options);
  },
  update(id: ToastId, options: Partial<ToastOptions>): void {
    return getToastStore().update(id, options);
  },
  dismiss(id: ToastId): void {
    return getToastStore().dismiss(id);
  },
  dismissAll(): void {
    return getToastStore().dismissAll();
  },
  pause(id: ToastId): void {
    return getToastStore().pause(id);
  },
  resume(id: ToastId): void {
    return getToastStore().resume(id);
  },
  getConfig(): ToastConfig {
    return getToastStore().getConfig();
  },

  toast(options: Partial<ToastOptions>): ToastId {
    return getToastStore().show({ ...options, type: "default" });
  },
  success(options: Partial<ToastOptions>): ToastId {
    return getToastStore().show({ ...options, type: "success" });
  },
  error(options: Partial<ToastOptions>): ToastId {
    return getToastStore().show({ ...options, type: "error" });
  },
  info(options: Partial<ToastOptions>): ToastId {
    return getToastStore().show({ ...options, type: "info" });
  },
  warning(options: Partial<ToastOptions>): ToastId {
    return getToastStore().show({ ...options, type: "warning" });
  },
};
